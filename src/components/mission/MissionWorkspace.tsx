"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Markdown } from "@/components/Markdown";
import { AiGuideChat } from "./AiGuideChat";
import { LEVEL_LABEL, type CapabilityLevel } from "@/lib/domain/types";

type Cap = { id: string; target_level: CapabilityLevel };

export function MissionWorkspace(props: {
  moduleId: string;
  title: string;
  cycle: number;
  order: number;
  briefing?: string;
  bossMission?: string;
  miniMissions?: string;
  knowledge?: string;
  capabilities: Cap[];
  opener: string;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<"briefing" | "build">("briefing");
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const storageKey = `academy:draft:${props.moduleId}`;

  // Recupera rascunho salvo (refresh não perde trabalho). Lê depois de montar
  // de propósito: no server localStorage não existe, e setar no init causaria
  // hydration mismatch. Por isso o setState no effect é correto aqui.
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setDraft(saved);
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, draft);
  }, [draft, storageKey]);

  const tooShort = draft.trim().length < 30;

  async function submit() {
    if (tooShort || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          moduleId: props.moduleId,
          missionId: "boss",
          content: draft,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha na avaliação.");
      localStorage.removeItem(storageKey);
      router.push(`/avaliacao/${data.submissionId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Algo deu errado.");
      setSubmitting(false);
    }
  }

  return (
    <div className="relative mx-auto max-w-6xl px-6 pb-16">
      {/* Header da missão */}
      <header className="flex items-center justify-between py-6">
        <Link
          href="/cockpit"
          className="mono text-xs tracking-wide text-muted transition-colors hover:text-fg"
        >
          ← COCKPIT
        </Link>
        <span className="mono rounded border border-border px-2 py-0.5 text-[11px] tracking-wide text-muted">
          CYCLE {props.cycle} · MÓDULO {String(props.order).padStart(2, "0")}
        </span>
      </header>

      <h1 className="text-2xl font-semibold text-fg">{props.title}</h1>

      {/* Capacidades-alvo */}
      <div className="mt-3 flex flex-wrap gap-2">
        {props.capabilities.map((c) => (
          <span
            key={c.id}
            className="mono rounded border border-border bg-surface px-2 py-1 text-[11px] text-muted"
          >
            {c.id}{" "}
            <span className="text-ember">→ {LEVEL_LABEL[c.target_level]}</span>
          </span>
        ))}
      </div>

      {/* Stepper */}
      <div className="mt-6 flex items-center gap-3">
        <Step n={1} label="Briefing" active={phase === "briefing"} done={phase === "build"} />
        <div className="h-px w-8 bg-border" />
        <Step n={2} label="Construir" active={phase === "build"} done={false} />
      </div>

      {phase === "briefing" ? (
        <section className="mt-6 rounded-lg border border-border bg-surface p-6 shadow-card">
          {props.briefing && <Markdown>{props.briefing}</Markdown>}
          <button
            onClick={() => setPhase("build")}
            className="group mt-6 inline-flex items-center gap-2 rounded-md bg-ember px-5 py-2.5 text-sm font-semibold text-bg transition-all hover:shadow-glow hover:brightness-110"
          >
            Começar a construir
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </button>
        </section>
      ) : (
        <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_380px]">
          {/* Coluna principal: missão + editor */}
          <div className="space-y-5">
            {props.bossMission && (
              <details
                open
                className="rounded-lg border border-border bg-surface p-5"
              >
                <summary className="mono cursor-pointer text-xs tracking-wide text-ember">
                  A MISSÃO
                </summary>
                <div className="mt-3">
                  <Markdown>{props.bossMission}</Markdown>
                </div>
              </details>
            )}

            <div className="rounded-lg border border-border bg-surface p-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="mono text-xs tracking-wide text-muted">
                  SEU ENTREGÁVEL
                </span>
                <span
                  className={`mono text-[11px] ${tooShort ? "text-muted" : "text-success"}`}
                >
                  {draft.trim().length} chars
                </span>
              </div>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Escreva aqui seu motor de decisão: entradas, regras, saída, o algoritmo SE/ENTÃO/SENÃO, os edge cases que você achou, e o que cortou e por quê."
                className="min-h-[320px] w-full resize-y rounded-md border border-border bg-bg px-4 py-3 text-sm leading-relaxed text-fg outline-none placeholder:text-muted/50 focus:border-ember/50"
              />

              {error && (
                <p className="mt-3 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
                  {error}
                </p>
              )}

              <button
                onClick={submit}
                disabled={tooShort || submitting}
                className="mt-4 inline-flex items-center gap-2 rounded-md bg-ember px-5 py-2.5 text-sm font-semibold text-bg transition-all hover:shadow-glow hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Avaliando seu trabalho..." : "Submeter pra avaliação"}
              </button>
              {tooShort && (
                <p className="mono mt-2 text-[11px] text-muted">
                  escreva um pouco mais antes de submeter
                </p>
              )}
            </div>
          </div>

          {/* Coluna lateral: AI Guide (desktop), em cima no mobile */}
          <div className="order-first h-[560px] lg:order-none lg:sticky lg:top-6">
            <AiGuideChat
              moduleId={props.moduleId}
              opener={props.opener}
              draft={draft}
            />
          </div>
        </section>
      )}

      {/* Overlay de avaliação */}
      {submitting && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-bg/80 backdrop-blur-sm">
          <div className="animate-rise-in flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-ember-pulse rounded-full border-2 border-ember/40" />
            <p className="mono text-sm tracking-wide text-fg">
              avaliando seu trabalho contra a rubrica...
            </p>
            <p className="text-xs text-muted">
              a IA não vê sua nota, vê sua evidência
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Step({
  n,
  label,
  active,
  done,
}: {
  n: number;
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`mono grid h-6 w-6 place-items-center rounded-full border text-[11px] ${
          active
            ? "border-ember bg-ember/10 text-ember"
            : done
              ? "border-success/40 bg-success/10 text-success"
              : "border-border text-muted"
        }`}
      >
        {done ? "✓" : n}
      </span>
      <span
        className={`mono text-xs tracking-wide ${active ? "text-fg" : "text-muted"}`}
      >
        {label}
      </span>
    </div>
  );
}
