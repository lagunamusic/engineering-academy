import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative grid min-h-screen place-items-center px-6">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-30" />
      <div className="relative text-center">
        <p className="mono text-6xl font-bold text-ember/80">404</p>
        <h1 className="mt-4 text-lg font-semibold text-fg">
          Essa rota não existe
        </h1>
        <p className="mt-2 text-sm text-muted">
          Talvez o módulo ainda não tenha sido construído, ou o link está torto.
        </p>
        <Link
          href="/cockpit"
          className="mono mt-5 inline-block rounded-md border border-border px-5 py-2.5 text-xs tracking-wide text-muted transition-colors hover:border-ember/40 hover:text-fg"
        >
          VOLTAR PRO COCKPIT
        </Link>
      </div>
    </main>
  );
}
