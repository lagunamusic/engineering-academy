"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type Status = "idle" | "sending" | "sent" | "error";

function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/cockpit";
  const configured = isSupabaseConfigured();

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("sending");
    setErrorMsg("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) throw error;
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error ? err.message : "Algo deu errado. Tente de novo.",
      );
    }
  }

  return (
    <main className="relative grid min-h-screen place-items-center px-6">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[560px] -translate-x-1/2 rounded-full bg-ember/10 blur-[120px]" />

      <div className="relative w-full max-w-sm">
        <Link
          href="/"
          className="mono mb-8 flex items-center gap-2 text-xs tracking-[0.2em] text-muted transition-colors hover:text-fg"
        >
          <span className="grid h-6 w-6 place-items-center rounded-md bg-ember text-xs font-bold text-bg">
            ⚡
          </span>
          ENGINEERING ACADEMY
        </Link>

        <div className="rounded-lg border border-border bg-surface p-7 shadow-card">
          {!configured ? (
            <ConfigNeeded />
          ) : status === "sent" ? (
            <SentState email={email} />
          ) : (
            <>
              <h1 className="text-xl font-semibold text-fg">Entrar</h1>
              <p className="mt-1 text-sm text-muted">
                Te mandamos um link mágico por e-mail. Sem senha pra decorar.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-3">
                <label className="block">
                  <span className="mono text-xs tracking-wide text-muted">
                    E-MAIL
                  </span>
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="voce@exemplo.com"
                    className="mt-1.5 w-full rounded-md border border-border bg-bg px-3 py-2.5 text-sm text-fg outline-none transition-colors placeholder:text-muted/60 focus:border-ember/60"
                  />
                </label>

                {status === "error" && (
                  <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full rounded-md bg-ember px-4 py-2.5 text-sm font-semibold text-bg transition-all hover:shadow-glow hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === "sending" ? "Enviando..." : "Enviar link mágico"}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="mono mt-5 text-center text-[11px] leading-relaxed tracking-wide text-muted">
          ao entrar você vira o Builder #1 da Academy
        </p>
      </div>
    </main>
  );
}

function SentState({ email }: { email: string }) {
  return (
    <div className="animate-rise-in text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-success/30 bg-success/10 text-success">
        ✓
      </div>
      <h1 className="mt-4 text-lg font-semibold text-fg">Link a caminho</h1>
      <p className="mt-2 text-sm text-muted">
        Abra o e-mail enviado pra{" "}
        <span className="text-fg">{email}</span> e clique no link pra entrar.
        Pode fechar esta aba.
      </p>
    </div>
  );
}

function ConfigNeeded() {
  return (
    <div>
      <h1 className="text-lg font-semibold text-fg">Quase lá</h1>
      <p className="mt-2 text-sm text-muted">
        O login precisa das chaves do Supabase. Você ainda não plugou elas.
      </p>
      <ol className="mono mt-4 space-y-2 text-xs leading-relaxed text-muted">
        <li>
          <span className="text-ember">1.</span> Crie um projeto em
          app.supabase.com
        </li>
        <li>
          <span className="text-ember">2.</span> Rode o SQL em
          supabase/migrations/0001_init.sql
        </li>
        <li>
          <span className="text-ember">3.</span> Copie .env.example pra
          .env.local e preencha
        </li>
        <li>
          <span className="text-ember">4.</span> Reinicie o{" "}
          <span className="text-fg">npm run dev</span>
        </li>
      </ol>
      <p className="mt-4 text-xs text-muted">
        O passo a passo completo está no README.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
