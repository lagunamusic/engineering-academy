// Configuração do Supabase lida do ambiente.
// Enquanto você (iniciante) ainda não plugou as chaves no .env.local, o app NÃO
// pode explodir: isSupabaseConfigured() vira false e as telas avisam com calma.

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

const PLACEHOLDERS = [
  "",
  "https://SEU-PROJETO.supabase.co",
  "sua-anon-key-publica",
];

export function isSupabaseConfigured(): boolean {
  return (
    !PLACEHOLDERS.includes(SUPABASE_URL) &&
    !PLACEHOLDERS.includes(SUPABASE_ANON_KEY) &&
    SUPABASE_URL.startsWith("http")
  );
}
