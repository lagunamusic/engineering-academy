import { NextResponse } from "next/server";
import { getModuleById } from "@/lib/modules/loader";
import { evaluateSubmission } from "@/lib/ai/evaluate";
import { isAnthropicConfigured } from "@/lib/ai/anthropic";

// DEV-ONLY. Roda o pipeline de avaliação COMPLETO (objetivo + IA + contrato)
// sem auth e sem gravar no banco. Faz chamada real à Anthropic — use com
// parcimônia (custa tokens). Serve pra provar/tunar o pipeline.
export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (!isAnthropicConfigured()) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY ausente" }, { status: 503 });
  }
  const body = (await request.json().catch(() => null)) as {
    moduleId?: string;
    content?: string;
  } | null;
  if (!body?.content) {
    return NextResponse.json({ error: "content obrigatório" }, { status: 400 });
  }
  const mod = await getModuleById(body.moduleId ?? "module-01");
  if (!mod) {
    return NextResponse.json({ error: "módulo não encontrado" }, { status: 404 });
  }
  try {
    const result = await evaluateSubmission({
      mod,
      missionTitle: "Boss Mission",
      submission: body.content,
      isGate: true,
    });
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
