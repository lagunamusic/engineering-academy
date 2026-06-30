"use client";

// Error boundary das rotas. Pega erro de render no servidor/cliente e oferece
// recuperação sem quebrar a tela inteira.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center px-6">
      <div className="max-w-md text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-danger/30 bg-danger/10 text-danger">
          !
        </div>
        <h1 className="mt-4 text-lg font-semibold text-fg">
          Algo quebrou aqui
        </h1>
        <p className="mt-2 text-sm text-muted">
          Não foi sua culpa. Você pode tentar de novo — seu progresso está salvo
          no banco, nada se perde.
        </p>
        {error.message && (
          <p className="mono mt-3 truncate rounded-md border border-border bg-surface px-3 py-2 text-[11px] text-muted">
            {error.message}
          </p>
        )}
        <button
          onClick={reset}
          className="mt-5 rounded-md bg-ember px-5 py-2.5 text-sm font-semibold text-bg transition-all hover:shadow-glow hover:brightness-110"
        >
          Tentar de novo
        </button>
      </div>
    </main>
  );
}
