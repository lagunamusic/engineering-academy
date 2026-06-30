import "server-only";

import type Anthropic from "@anthropic-ai/sdk";
import type { LoadedModule } from "@/lib/modules/schema";
import { getAnthropic, MODELS } from "./anthropic";
import {
  buildDraftContext,
  buildMentoringSystem,
  buildMentoringUserMessage,
} from "./prompts";

export type ChatTurn = { role: "user" | "assistant"; content: string };

// Resposta do AI Guide. Mentoria = Haiku (rotineiro). Toda fala do Builder vai
// embrulhada como dado (anti-injeção). Nunca entrega a solução.
// `draft` = o entregável atual do editor: contexto vivo do que ele constrói.
export async function mentorReply(
  mod: LoadedModule,
  turns: ChatTurn[],
  draft?: string,
): Promise<string> {
  const client = getAnthropic();

  // Bloco estável (instruções + módulo) vai CACHED — barato em chamadas
  // repetidas. O entregável atual entra num bloco pequeno SEM cache (ele muda),
  // pra o Guide sempre enxergar o que está sendo construído.
  const systemBlocks: Anthropic.TextBlockParam[] = [
    {
      type: "text",
      text: buildMentoringSystem(mod),
      cache_control: { type: "ephemeral" },
    },
  ];
  if (draft && draft.trim().length > 0) {
    systemBlocks.push({ type: "text", text: buildDraftContext(draft) });
  }

  // Sinal de esforço: quantas vezes o Builder já tentou. Alimenta a ajuda
  // graduada — depois de ~2-3 tentativas presas, o Guide para de segurar.
  const builderAttempts = turns.filter((t) => t.role === "user").length;
  systemBlocks.push({
    type: "text",
    text: `ESTADO DA CONVERSA: o Builder já enviou ${builderAttempts} mensagem(ns) nesta missão. Se ele já tentou de verdade umas 2 ou 3 vezes o mesmo ponto e continua preso ou frustrado, NÃO segure mais — dê a resposta concreta com o porquê.`,
  });

  const messages = turns.map((t) => ({
    role: t.role,
    content:
      t.role === "user" ? buildMentoringUserMessage(t.content) : t.content,
  }));

  const resp = await client.messages.create({
    model: MODELS.routine,
    max_tokens: 600,
    temperature: 0.4,
    system: systemBlocks,
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
