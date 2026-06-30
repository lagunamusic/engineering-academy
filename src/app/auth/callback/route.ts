import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";

// Aterrissagem do magic link. Trata os dois fluxos:
//   - token_hash + type  -> verifyOtp (robusto, funciona entre navegadores)
//   - code               -> exchangeCodeForSession (PKCE)
// CRÍTICO: os cookies de sessão são escritos DIRETO no objeto `response` do
// redirect — senão a sessão se perde no caminho e o Builder volta pro login.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const next = searchParams.get("next") ?? "/cockpit";
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  // Resposta de sucesso preparada ANTES, pra os cookies grudarem nela.
  const success = NextResponse.redirect(`${origin}${next}`);

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          success.cookies.set(name, value, options),
        );
      },
    },
  });

  let errorMsg: string | null = null;

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) return success;
    errorMsg = `token: ${error.message}`;
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return success;
    errorMsg = `code: ${error.message}`;
  } else {
    errorMsg = "link sem code nem token_hash";
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent(errorMsg)}`,
  );
}
