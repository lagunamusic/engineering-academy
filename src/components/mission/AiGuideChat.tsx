"use client";

import { useEffect, useRef, useState } from "react";

type ChatTurn = { role: "user" | "assistant"; content: string };

export function AiGuideChat({
  moduleId,
  opener,
  draft,
}: {
  moduleId: string;
  opener: string;
  draft?: string;
}) {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [turns, loading]);

  async function post(nextTurns: ChatTurn[]) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai-guide", {
        method: "POST",
        headers: { "content-type": "application/json" },
        // Só manda turnos com conteúdo — vazio não trafega. Manda também o
        // rascunho atual: o Guide vê o que está sendo construído.
        body: JSON.stringify({
          moduleId,
          turns: nextTurns.filter((t) => t.content.trim().length > 0),
          draft,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao falar com o Guide.");
      setTurns([
        ...nextTurns,
        {
          role: "assistant",
          content: data.reply || "Me conta mais sobre o seu raciocínio aqui.",
        },
      ]);
    } catch (e) {
      // Mantém a mensagem do Builder na tela e oferece retry.
      setTurns(nextTurns);
      setError(e instanceof Error ? e.message : "Algo deu errado.");
    } finally {
      setLoading(false);
    }
  }

  function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    post([...turns, { role: "user", content: text }]);
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-surface">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="grid h-5 w-5 place-items-center rounded bg-ember/15 text-[11px] text-ember">
          ◆
        </span>
        <span className="mono text-xs tracking-wide text-fg">AI GUIDE</span>
        <span className="mono ml-auto text-[10px] tracking-wide text-muted">
          mentor · não dá a resposta
        </span>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {/* Abertura (provocação inicial) */}
        <Bubble role="assistant">{opener}</Bubble>

        {turns.map((t, i) => (
          <Bubble key={i} role={t.role}>
            {t.content}
          </Bubble>
        ))}

        {loading && (
          <div className="flex items-center gap-1.5 px-1 text-muted">
            <Dot /> <Dot /> <Dot />
          </div>
        )}

        {error && (
          <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
            {error}{" "}
            <button
              onClick={() => post(turns)}
              className="ml-1 underline hover:text-fg"
            >
              tentar de novo
            </button>
          </div>
        )}
      </div>

      <div className="border-t border-border p-3">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={2}
            placeholder="Responda ao Guide ou pergunte..."
            className="max-h-32 flex-1 resize-none rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg outline-none placeholder:text-muted/60 focus:border-ember/50"
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="rounded-md bg-ember px-3 py-2 text-sm font-semibold text-bg transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}

function Bubble({
  role,
  children,
}: {
  role: "user" | "assistant";
  children: string;
}) {
  const isUser = role === "user";
  return (
    <div
      className={`animate-rise-in max-w-[88%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm leading-relaxed ${
        isUser
          ? "ml-auto border border-border bg-surface-high text-fg"
          : "border border-ember/20 bg-ember/5 text-fg"
      }`}
    >
      {children}
    </div>
  );
}

function Dot() {
  return (
    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted [animation-duration:1s]" />
  );
}
