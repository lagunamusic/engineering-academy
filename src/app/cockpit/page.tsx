import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getBuilderState } from "@/lib/builder/state";
import { getModuleById } from "@/lib/modules/loader";
import { AppNav } from "@/components/AppNav";
import { LEVEL_LABEL } from "@/lib/domain/types";

// Página por-Builder, autenticada: sempre dinâmica (nunca prerender estático).
export const dynamic = "force-dynamic";

export default async function CockpitPage() {
  if (!isSupabaseConfigured()) redirect("/login");

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const state = await getBuilderState(supabase, user.id);
  const next = state.nextStep;
  const nextModule = next ? await getModuleById(next.moduleId) : null;

  const earnedCaps = Object.values(state.capabilities).filter(
    (c) => c.level !== "none",
  );

  return (
    <main className="relative min-h-screen">
      <AppNav email={user.email} />
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-20" />

      <div className="relative mx-auto max-w-3xl px-6 pb-16">
        {/* Próximo passo */}
        <section className="py-10">
          <p className="mono text-xs tracking-[0.2em] text-ember">
            SEU PRÓXIMO PASSO
          </p>

          {next && nextModule ? (
            <div className="mt-4 rounded-lg border border-border bg-surface p-6 shadow-card">
              <span className="mono rounded border border-border px-2 py-0.5 text-[11px] tracking-wide text-muted">
                CYCLE {nextModule.frontmatter.cycle} · MÓDULO{" "}
                {String(nextModule.frontmatter.order).padStart(2, "0")} ·{" "}
                {next.status === "in_progress" ? "EM ANDAMENTO" : "DISPONÍVEL"}
              </span>
              <h1 className="mt-3 text-2xl font-semibold text-fg">
                {nextModule.frontmatter.title}
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
                {nextModule.sections.purpose}
              </p>
              <Link
                href={`/missao/${next.moduleId}`}
                className="group mt-6 inline-flex items-center gap-2 rounded-md bg-ember px-5 py-2.5 text-sm font-semibold text-bg transition-all hover:shadow-glow hover:brightness-110"
              >
                {next.status === "in_progress" ? "Continuar missão" : "Entrar na missão"}
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </Link>
            </div>
          ) : (
            <div className="mt-4 rounded-lg border border-border bg-surface p-6">
              <h1 className="text-xl font-semibold text-fg">
                Tudo em dia por aqui
              </h1>
              <p className="mt-2 text-sm text-muted">
                Você fechou o que estava disponível. O próximo módulo abre quando
                o gate atual for revisado.
              </p>
            </div>
          )}
        </section>

        {/* Reforço dirigido (se houver leak reincidente) */}
        {state.reinforcements.length > 0 && (
          <section className="mb-8 rounded-lg border border-warning/30 bg-warning/5 p-5">
            <p className="mono text-xs tracking-[0.2em] text-warning">
              REFORÇO DIRIGIDO
            </p>
            <p className="mt-2 text-sm text-fg">
              Um padrão de erro se repetiu entre módulos:{" "}
              <span className="mono text-warning">
                {state.reinforcements.join(", ")}
              </span>
              . Capacidade cresce fechando fraqueza, não somando aula.
            </p>
          </section>
        )}

        {/* Capacidades em formação (sem número de vaidade) */}
        <section>
          <p className="mono mb-3 text-xs tracking-[0.2em] text-muted">
            O QUE VOCÊ JÁ CONSEGUE FAZER
          </p>
          {earnedCaps.length === 0 ? (
            <p className="text-sm text-muted">
              Nenhuma capacidade comprovada ainda. Ela aparece aqui quando sua
              evidência destrava o nível — não antes.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {earnedCaps.map((c) => (
                <div
                  key={c.id}
                  className="rounded-lg border border-border bg-surface p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="mono text-sm text-fg">{c.id}</span>
                    <span
                      className={`mono text-xs ${c.cooled ? "text-cooled" : "text-ember"}`}
                    >
                      {LEVEL_LABEL[c.level]}
                    </span>
                  </div>
                  <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-bg">
                    <div
                      className={`h-full rounded-full ${c.cooled ? "bg-cooled" : "bg-ember"}`}
                      style={{ width: `${c.intensity}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
