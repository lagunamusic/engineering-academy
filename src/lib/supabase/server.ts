import "server-only";

// Cliente Supabase pro SERVIDOR (Server Components, Route Handlers, Server
// Actions). Lê a sessão dos cookies. No Next 16 o cookies() é assíncrono.

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // Em Server Components puros o set falha (read-only). O middleware é
        // quem renova a sessão, então engolir aqui é seguro e esperado.
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          /* read-only context — ok */
        }
      },
    },
  });
}

// Cliente com SERVICE ROLE (fura o RLS). Use com MUITO cuidado, só em backend,
// e nunca devolva dados de outro Builder. Necessário em poucos pontos (ex:
// gravar avaliação validando a posse server-side).
import { createClient } from "@supabase/supabase-js";

export function createSupabaseAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY ausente. Defina no .env.local (nunca no frontend).",
    );
  }
  return createClient(SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
