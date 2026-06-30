import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";

// Renova a sessão do Supabase a cada navegação e protege as rotas internas.
// Sem chaves configuradas, vira no-op (o app ainda roda, só não autentica).
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (!isSupabaseConfigured()) return response;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // IMPORTANTE: getUser() revalida o token no servidor. Não confie só no cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Rotas do app (autenticadas) começam com estes prefixos.
  const protectedPrefixes = [
    "/cockpit",
    "/trilha",
    "/missao",
    "/avaliacao",
    "/skill-tree",
    "/portfolio",
  ];
  const { pathname } = request.nextUrl;
  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}
