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
        // Sem min: turno vazio não pode derrubar a validação. Filtramos depois.
        content: z.string().max(8000),
      }),
    )
    .min(1)
    .max(60),
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

  // Validação de input no servidor antes de qualquer coisa. Erro descritivo.
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    const detail = parsed.error.issues
      .map((i) => `${i.path.join(".") || "body"}: ${i.message}`)
      .join("; ");
    console.error("[ai-guide] payload inválido:", detail);
    return NextResponse.json(
      { error: `Payload inválido — ${detail}` },
      { status: 400 },
    );
  }

  const mod = await getModuleById(parsed.data.moduleId);
  if (!mod) {
    return NextResponse.json({ error: "Módulo não encontrado." }, { status: 404 });
  }

  // Descarta turnos vazios (uma resposta vazia da IA não pode travar o chat)
  // e garante que sobrou algo pra responder.
  const turns = parsed.data.turns.filter(
    (t) => t.content.trim().length > 0,
  ) as ChatTurn[];
  if (turns.length === 0) {
    return NextResponse.json(
      { error: "Mensagem vazia." },
      { status: 400 },
    );
  }

  try {
    const reply = await mentorReply(mod, turns);
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
