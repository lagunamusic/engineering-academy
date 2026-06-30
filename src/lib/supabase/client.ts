"use client";

// Cliente Supabase pro BROWSER. Usa só a anon key (pública). O RLS é quem
// protege os dados — a anon key sozinha não acessa nada de ninguém.

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

export function createSupabaseBrowserClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
