import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getBuilderState } from "@/lib/builder/state";
import { AppNav } from "@/components/AppNav";
import type { ModuleStatus } from "@/lib/domain/types";

// Forma planejada da jornada. Módulos que existem de verdade (no loader) pegam
// o status real; o resto fica locked, dando o horizonte sem inventar conteúdo.
const ROADMAP: {
  cycle: number;
  name: string;
  modules: { id?: string; order: string; title: string }[];
}[] = [
  {
    cycle: 1,
    name: "Engineering Foundations",
    modules: [
      { id: "module-01", order: "01", title: "Introduction to Engineering" },
      { order: "02", title: "Computational Thinking" },
      { order: "03", title: "Programming Fundamentals" },
      { order: "04", title: "Git & Version Control" },
      { order: "05", title: "Clean Code" },
      { order: "★", title: "Boss Project I — Your First Application" },
    ],
  },
  { cycle: 2, name: "Software Engineering", modules: [] },
  { cycle: 3, name: "Modern Engineering", modules: [] },
  { cycle: 4, name: "AI Engineering", modules: [] },
];

const STATUS_META: Record<
  ModuleStatus,
  { mark: string; cls: string; label: string }
> = {
  passed: { mark: "✓", cls: "text-success border-success/40", label: "passed" },
  in_progress: { mark: "•", cls: "text-ember border-ember/50", label: "em andamento" },
  available: { mark: "→", cls: "text-ember border-ember/50", label: "disponível" },
  locked: { mark: "🔒", cls: "text-muted border-border", label: "locked" },
};

export const dynamic = "force-dynamic";

export default async function TrilhaPage() {
  if (!isSupabaseConfigured()) redirect("/login");

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const state = await getBuilderState(supabase, user.id);
  const statusById = new Map(state.modules.map((m) => [m.id, m.status]));

  return (
    <main className="relative min-h-screen">
      <AppNav email={user.email} />
      <div className="relative mx-auto max-w-3xl px-6 pb-16">
        <header className="py-8">
          <h1 className="text-2xl font-semibold text-fg">A Trilha</h1>
          <p className="mt-2 text-sm text-muted">
            A escada de maturidade. Você avança por evidência, não por tempo. O
            que está na frente espera o gate.
          </p>
        </header>

        <div className="space-y-8">
          {ROADMAP.map((cyc) => (
            <section key={cyc.cycle}>
              <div className="mb-3 flex items-center gap-3">
                <span className="mono text-2xl font-bold text-ember/70">
                  {romanize(cyc.cycle)}
                </span>
                <span className="mono text-xs tracking-[0.2em] text-muted">
                  {cyc.name.toUpperCase()}
                </span>
              </div>

              {cyc.modules.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-surface/40 px-4 py-3">
                  <span className="mono text-xs text-muted">
                    🔒 abre depois do Cycle {romanize(cyc.cycle - 1)}
                  </span>
                </div>
              ) : (
                <ol className="space-y-2">
                  {cyc.modules.map((m) => {
                    const status: ModuleStatus = m.id
                      ? (statusById.get(m.id) ?? "available")
                      : "locked";
                    const meta = STATUS_META[status];
                    const clickable =
                      m.id && status !== "locked" ? `/missao/${m.id}` : null;

                    const inner = (
                      <div
                        className={`flex items-center gap-3 rounded-lg border bg-surface px-4 py-3 transition-colors ${
                          clickable
                            ? "hover:border-ember/40 hover:bg-surface-high"
                            : ""
                        } ${status === "locked" ? "opacity-60" : ""}`}
                      >
                        <span
                          className={`mono grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs ${meta.cls}`}
                        >
                          {meta.mark}
                        </span>
                        <span className="mono text-[11px] text-muted">
                          {m.order}
                        </span>
                        <span
                          className={`text-sm ${status === "locked" ? "text-muted" : "text-fg"}`}
                        >
                          {m.title}
                        </span>
                        <span className="mono ml-auto text-[10px] tracking-wide text-muted">
                          {meta.label}
                        </span>
                      </div>
                    );

                    return (
                      <li key={m.order}>
                        {clickable ? (
                          <Link href={clickable}>{inner}</Link>
                        ) : (
                          inner
                        )}
                      </li>
                    );
                  })}
                </ol>
              )}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

function romanize(n: number): string {
  return ["", "I", "II", "III", "IV"][n] ?? String(n);
}
