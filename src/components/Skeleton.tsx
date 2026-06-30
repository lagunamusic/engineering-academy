// Bloco de skeleton (estado de carregando). Respeita reduced-motion via CSS.
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

// Barra de topo placeholder, pra loading.tsx das telas autenticadas.
export function NavSkeleton() {
  return (
    <div className="border-b border-border bg-bg/80">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-3">
        <Skeleton className="h-6 w-6 rounded-md" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="ml-auto h-5 w-28" />
      </div>
    </div>
  );
}
