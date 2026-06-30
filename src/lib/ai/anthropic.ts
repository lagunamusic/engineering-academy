import "server-only";

import Anthropic from "@anthropic-ai/sdk";

// Cliente Anthropic. SÓ no backend — a chave NUNCA vai pro frontend.
// Modelos: Haiku no rotineiro (mentoria, feedback de missão), Sonnet nos
// gates e Boss Projects (decisão de alto risco). Configuráveis por env.

export const MODELS = {
  routine: process.env.ANTHROPIC_MODEL_ROUTINE ?? "claude-haiku-4-5-20251001",
  gate: process.env.ANTHROPIC_MODEL_GATE ?? "claude-sonnet-4-6",
} as const;

let _client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY ausente. Defina no .env.local (só backend).",
    );
  }
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

export function isAnthropicConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}
