import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// O link mágico do e-mail aterrissa aqui com um ?code=... (fluxo PKCE).
// Trocamos o código por uma sessão e mandamos o Builder pro destino.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/cockpit";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Falhou: volta pro login com um aviso.
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
