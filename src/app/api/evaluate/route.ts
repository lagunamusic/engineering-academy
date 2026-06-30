import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { friendlyAiError, isAnthropicConfigured } from "@/lib/ai/anthropic";
import { getModuleById } from "@/lib/modules/loader";
import { evaluateSubmission } from "@/lib/ai/evaluate";
import { applyEvaluation } from "@/lib/builder/apply-evaluation";
import { rateLimit } from "@/lib/ratelimit";

// Pipeline de avaliação por evidência. Submissão -> objetivo por regra ->
// IA (Sonnet no gate) -> valida contrato -> grava tudo -> capacidades/leaks.
const bodySchema = z.object({
  moduleId: z.string().min(1),
  missionId: z.string().min(1).default("boss"),
  content: z.string().min(30, "Escreva mais — o entregável está curto demais.").max(20_000),
});

export async function POST(request: Request) {
  if (!isAnthropicConfigured()) {
    return NextResponse.json(
      { error: "A avaliação precisa da ANTHROPIC_API_KEY no .env.local." },
      { status: 503 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  // Avaliação é cara: rate limit mais apertado.
  const rl = rateLimit(`evaluate:${user.id}`, 6, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Muitas submissões seguidas. Respire e tente em instantes." },
      { status: 429 },
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Payload inválido." },
      { status: 400 },
    );
  }

  const { moduleId, missionId, content } = parsed.data;
  const mod = await getModuleById(moduleId);
  if (!mod) {
    return NextResponse.json({ error: "Módulo não encontrado." }, { status: 404 });
  }

  // O Boss é a missão que vale o gate (Sonnet, temperatura baixa).
  const isGate = missionId === "boss";
  const missionTitle =
    missionId === "boss" ? "Boss Mission" : `Missão ${missionId}`;

  try {
    const result = await evaluateSubmission({
      mod,
      missionTitle,
      submission: content,
      isGate,
    });

    const { submissionId } = await applyEvaluation({
      supabase,
      builderId: user.id,
      mod,
      missionId,
      submissionText: content,
      result,
    });

    return NextResponse.json({ submissionId, result });
  } catch (err) {
    return NextResponse.json({ error: friendlyAiError(err) }, { status: 502 });
  }
}
