import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { ensureProgressBootstrap } from "@/lib/builder/progress";
import { getModuleById, loadAllModules } from "@/lib/modules/loader";
import { SignOutButton } from "@/components/SignOutButton";

export default async function CockpitPage() {
  // Sem chaves, não dá pra autenticar: manda pro login (que explica o setup).
  if (!isSupabaseConfigured()) redirect("/login");

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Garante o progresso inicial (Módulo 01 nasce available).
  await ensureProgressBootstrap(supabase, user.id);

  // Carrega e VALIDA o Módulo 01 do arquivo (a prova de que o loader funciona).
  const all = await loadAllModules();
  const firstModule = (await getModuleById("module-01")) ?? all[0] ?? null;

  return (
    <main className="relative min-h-screen">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-30" />

      <div className="relative mx-auto max-w-3xl px-6">
        <header className="flex items-center justify-between py-6">
          <Link
            href="/"
            className="mono flex items-center gap-2 text-xs tracking-[0.2em] text-fg"
          >
            <span className="grid h-6 w-6 place-items-center rounded-md bg-ember text-xs font-bold text-bg">
              ⚡
            </span>
            COCKPIT
          </Link>
          <div className="flex items-center gap-4">
            <span className="mono hidden text-xs text-muted sm:inline">
              {user.email}
            </span>
            <SignOutButton />
          </div>
        </header>

        <section className="py-10">
          <p className="mono text-xs tracking-[0.2em] text-ember">
            SEU PRÓXIMO PASSO
          </p>

          {firstModule ? (
            <div className="mt-4 rounded-lg border border-border bg-surface p-6 shadow-card">
              <div className="flex items-center gap-2">
                <span className="mono rounded border border-border px-2 py-0.5 text-[11px] tracking-wide text-muted">
                  CYCLE {firstModule.frontmatter.cycle} · MÓDULO{" "}
                  {String(firstModule.frontmatter.order).padStart(2, "0")}
                </span>
              </div>
              <h1 className="mt-3 text-2xl font-semibold text-fg">
                {firstModule.frontmatter.title}
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
                {firstModule.sections.purpose ??
                  "Comece pelo briefing e construa sua primeira evidência de capacidade."}
              </p>

              <Link
                href={`/missao/${firstModule.frontmatter.id}`}
                className="group mt-6 inline-flex items-center gap-2 rounded-md bg-ember px-5 py-2.5 text-sm font-semibold text-bg transition-all hover:shadow-glow hover:brightness-110"
              >
                Entrar na missão
                <span className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">
              Nenhum módulo encontrado em docs/academy/.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
