import "server-only";

import Anthropic from "@anthropic-ai/sdk";

// Cliente Anthropic. SÓ no backend — a chave NUNCA vai pro frontend.
// Modelos: Haiku no rotineiro (mentoria, feedback de missão), Sonnet nos
// gates e Boss Projects (decisão de alto risco). Configuráveis por env.

export const MODELS = {
  // Rotineiro (mentoria/chat): Haiku — rápido e barato, roda a cada mensagem.
  routine: process.env.ANTHROPIC_MODEL_ROUTINE ?? "claude-haiku-4-5-20251001",
  // Gate/Boss: Opus 4.8, o mais forte — julgamento afiado no que decide fase.
  gate: process.env.ANTHROPIC_MODEL_GATE ?? "claude-opus-4-8",
} as const;

let _client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY ausente. Defina no .env.local (só backend).",
    );
  }
  if (!_client) {
    // maxRetries alto + backoff do SDK: aguenta sobrecarga temporária (529)
    // e rate limit (429) sem estourar erro na cara do Builder.
    _client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      maxRetries: 4,
    });
  }
  return _client;
}

export function isAnthropicConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

// Converte erro da Anthropic numa mensagem humana (nada de JSON cru na tela).
export function friendlyAiError(err: unknown): string {
  const status = (err as { status?: number })?.status;
  if (status === 529 || status === 503) {
    return "A IA está sobrecarregada neste momento (instabilidade temporária da Anthropic, não é você). Seu trabalho está salvo — tente de novo em alguns segundos.";
  }
  if (status === 429) {
    return "Muitas chamadas à IA agora. Aguarde alguns segundos e tente de novo.";
  }
  if (typeof status === "number" && status >= 500) {
    return "A IA teve uma instabilidade temporária. Seu trabalho está salvo — é só tentar de novo.";
  }
  return err instanceof Error ? err.message : "Falha ao falar com a IA.";
}
