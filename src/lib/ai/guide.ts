import "server-only";

import type Anthropic from "@anthropic-ai/sdk";
import type { LoadedModule } from "@/lib/modules/schema";
import { getAnthropic, MODELS } from "./anthropic";
import { buildMentoringSystem, buildMentoringUserMessage } from "./prompts";

export type ChatTurn = { role: "user" | "assistant"; content: string };

// Resposta do AI Guide. Mentoria = Haiku (rotineiro). Toda fala do Builder vai
// embrulhada como dado (anti-injeção). Nunca entrega a solução.
export async function mentorReply(
  mod: LoadedModule,
  turns: ChatTurn[],
): Promise<string> {
  const client = getAnthropic();
  const system = buildMentoringSystem(mod);

  const messages = turns.map((t) => ({
    role: t.role,
    content:
      t.role === "user" ? buildMentoringUserMessage(t.content) : t.content,
  }));

  const resp = await client.messages.create({
    model: MODELS.routine,
    max_tokens: 600,
    temperature: 0.4,
    system: [
      { type: "text", text: system, cache_control: { type: "ephemeral" } },
    ],
    messages,
  });

  const text = resp.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();

  // Nunca devolve vazio: um turno vazio quebraria a conversa seguinte.
  return text || "Me explica melhor: o que você acha que acontece nesse caso?";
}
