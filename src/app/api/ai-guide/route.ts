import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAnthropicConfigured } from "@/lib/ai/anthropic";
import { getModuleById } from "@/lib/modules/loader";
import { mentorReply, type ChatTurn } from "@/lib/ai/guide";
import { rateLimit } from "@/lib/ratelimit";

// Chat do AI Guide. Mentoria que provoca, nunca entrega a resposta.
const bodySchema = z.object({
  moduleId: z.string().min(1),
  turns: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000), // teto de custo
      }),
    )
    .min(1)
    .max(40),
});

export async function POST(request: Request) {
  if (!isAnthropicConfigured()) {
    return NextResponse.json(
      { error: "O AI Guide precisa da ANTHROPIC_API_KEY no .env.local." },
      { status: 503 },
    );
  }

  // Auth: só Builder logado fala com o Guide.
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  // Rate limit por Builder (chat é mais permissivo).
  const rl = rateLimit(`guide:${user.id}`, 20, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Calma, muitas mensagens. Tente em instantes." },
      { status: 429 },
    );
  }

  // Validação de input no servidor antes de qualquer coisa.
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const mod = await getModuleById(parsed.data.moduleId);
  if (!mod) {
    return NextResponse.json({ error: "Módulo não encontrado." }, { status: 404 });
  }

  try {
    const reply = await mentorReply(mod, parsed.data.turns as ChatTurn[]);
    return NextResponse.json({ reply });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Falha ao falar com o AI Guide.",
      },
      { status: 500 },
    );
  }
}
