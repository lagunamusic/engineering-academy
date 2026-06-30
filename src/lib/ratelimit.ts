// Rate limit simples, em memória. Best-effort: vale por instância do servidor,
// não é distribuído. Pro MVP segura abuso e protege o custo de API. Em produção
// séria, troque por um store compartilhado (ex: Upstash/Redis).

const hits = new Map<string, number[]>();

export function rateLimit(
  key: string,
  max: number,
  windowMs: number,
): { ok: boolean; retryAfterMs: number } {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= max) {
    const retryAfterMs = windowMs - (now - arr[0]);
    hits.set(key, arr);
    return { ok: false, retryAfterMs };
  }
  arr.push(now);
  hits.set(key, arr);
  return { ok: true, retryAfterMs: 0 };
}
