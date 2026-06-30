import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { EvaluationContract } from "@/lib/ai/contract";
import {
  intensityForLevel,
  LEVEL_LABEL,
  type CapabilityLevel,
} from "@/lib/domain/types";

export default async function ResultPage({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  if (!isSupabaseConfigured()) redirect("/login");
  const { submissionId } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // RLS já garante posse, mas filtramos por builder_id também (defesa em camadas).
  const { data: evaluation } = await supabase
    .from("evaluations")
    .select("resultado_json, gate_passed, revisado_por_humano, module_id")
    .eq("submission_id", submissionId)
    .eq("builder_id", user.id)
    .order("criado_em", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!evaluation) notFound();

  const result = evaluation.resultado_json as EvaluationContract;
  const passed = evaluation.gate_passed;

  return (
    <main className="relative min-h-screen">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-20" />
      <div className="relative mx-auto max-w-2xl px-6 pb-20">
        <header className="py-6">
          <Link
            href="/cockpit"
            className="mono text-xs tracking-wide text-muted transition-colors hover:text-fg"
          >
            ← COCKPIT
          </Link>
        </header>

        {/* Banner do gate */}
        <section
          className={`animate-rise-in rounded-lg border p-6 ${
            passed
              ? "border-ember/40 bg-ember/5 glow-soft"
              : "border-border bg-surface"
          }`}
        >
          <p className="mono text-xs tracking-[0.2em] text-muted">
            RESULTADO DA AVALIAÇÃO
          </p>
          <h1
            className={`mt-2 text-2xl font-semibold ${passed ? "text-ember text-glow" : "text-fg"}`}
          >
            {passed ? "Capacidade comprovada" : "Ainda não — falta uma coisa"}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {passed
              ? "Sua evidência bateu o corte do gate. Você decompôs um problema real e achou onde sua própria solução quebrava."
              : "Você está perto. O gate pede uma evidência que ainda não apareceu no entregável. Veja abaixo o próximo passo exato."}
          </p>
        </section>

        {/* Capacidades + intensidade */}
        <section className="mt-6">
          <p className="mono mb-3 text-xs tracking-[0.2em] text-muted">
            CAPACIDADES
          </p>
          <div className="space-y-3">
            {result.capabilities.map((c) => {
              const intensity = intensityForLevel(c.level as CapabilityLevel);
              return (
                <div
                  key={c.id}
                  className="rounded-lg border border-border bg-surface p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="mono text-sm text-fg">{c.id}</span>
                    <span className="mono text-xs text-ember">
                      {LEVEL_LABEL[c.level as CapabilityLevel]}
                    </span>
                  </div>
                  <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-bg">
                    <div
                      className="h-full rounded-full bg-ember transition-all"
                      style={{
                        width: `${intensity}%`,
                        boxShadow:
                          intensity >= 75
                            ? "0 0 12px rgba(255,122,26,0.6)"
                            : "none",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Feedback no contrato fixo */}
        <section className="mt-6 space-y-3">
          <FeedbackCard
            label="O QUE FOI BEM"
            tone="success"
            text={result.feedback.did_well}
          />
          <FeedbackCard
            label={passed ? "PRA IR ALÉM" : "O GAP QUE TRAVA"}
            tone={passed ? "neutral" : "warning"}
            text={result.feedback.to_improve}
          />
          <FeedbackCard
            label="POR QUE IMPORTA"
            tone="neutral"
            text={result.feedback.why}
          />
        </section>

        {/* Próxima micro-missão (quando não passou) */}
        {!passed && result.next_micro_mission && (
          <section className="mt-6 rounded-lg border border-ember/30 bg-ember/5 p-5">
            <p className="mono text-xs tracking-[0.2em] text-ember">
              SUA PRÓXIMA MICRO-MISSÃO
            </p>
            <p className="mt-2 text-sm leading-relaxed text-fg">
              {result.next_micro_mission}
            </p>
          </section>
        )}

        {/* Leaks detectados */}
        {result.leak_tags.length > 0 && (
          <section className="mt-6">
            <p className="mono mb-2 text-xs tracking-[0.2em] text-muted">
              PADRÕES DE ERRO REGISTRADOS
            </p>
            <div className="flex flex-wrap gap-2">
              {result.leak_tags.map((t) => (
                <span
                  key={t}
                  className="mono rounded border border-warning/30 bg-warning/10 px-2 py-1 text-[11px] text-warning"
                >
                  {t}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Nota de revisão humana no gate (MVP) */}
        {passed && !evaluation.revisado_por_humano && (
          <p className="mono mt-6 rounded-md border border-border bg-surface px-4 py-3 text-[11px] leading-relaxed text-muted">
            o desbloqueio do próximo módulo passa por revisão humana (MVP). sua
            capacidade já está registrada.
          </p>
        )}

        {/* Ações */}
        <div className="mt-8 flex flex-wrap gap-3">
          {passed ? (
            <>
              <Link
                href="/skill-tree"
                className="rounded-md bg-ember px-5 py-2.5 text-sm font-semibold text-bg transition-all hover:shadow-glow hover:brightness-110"
              >
                Ver sua Skill Tree
              </Link>
              <Link
                href="/cockpit"
                className="rounded-md border border-border px-5 py-2.5 text-sm text-muted transition-colors hover:border-ember/40 hover:text-fg"
              >
                Voltar ao Cockpit
              </Link>
            </>
          ) : (
            <Link
              href={`/missao/${evaluation.module_id}`}
              className="rounded-md bg-ember px-5 py-2.5 text-sm font-semibold text-bg transition-all hover:shadow-glow hover:brightness-110"
            >
              Voltar e fortalecer o entregável
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}

function FeedbackCard({
  label,
  text,
  tone,
}: {
  label: string;
  text: string;
  tone: "success" | "warning" | "neutral";
}) {
  const accent =
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-warning"
        : "text-muted";
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className={`mono text-xs tracking-[0.2em] ${accent}`}>{label}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-fg">{text}</p>
    </div>
  );
}
