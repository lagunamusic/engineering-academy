import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { AppNav } from "@/components/AppNav";

const PAGE_SIZE = 8;

export const dynamic = "force-dynamic";

export default async function PortfolioPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  if (!isSupabaseConfigured()) redirect("/login");
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: items, count } = await supabase
    .from("portfolio_items")
    .select("id, titulo, conteudo, module_id, criado_em", { count: "exact" })
    .eq("builder_id", user.id)
    .order("criado_em", { ascending: false })
    .range(from, to);

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main className="relative min-h-screen">
      <AppNav email={user.email} />
      <div className="relative mx-auto max-w-3xl px-6 pb-16">
        <header className="py-8">
          <h1 className="text-2xl font-semibold text-fg">Portfólio</h1>
          <p className="mt-2 text-sm text-muted">
            Cada peça aqui é uma evidência permanente de capacidade — não uma
            aula concluída, uma prova do que você construiu.
          </p>
        </header>

        {!items || items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-surface/40 p-10 text-center">
            <p className="text-sm text-muted">
              Seu portfólio enche conforme você constrói. Feche o Módulo 01 e sua
              primeira evidência aparece aqui.
            </p>
            <Link
              href="/cockpit"
              className="mono mt-4 inline-block text-xs tracking-wide text-ember hover:underline"
            >
              IR PRO PRÓXIMO PASSO →
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {items.map((it) => (
                <article
                  key={it.id}
                  className="rounded-lg border border-border bg-surface p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-sm font-medium text-fg">{it.titulo}</h2>
                    <span className="mono shrink-0 text-[10px] tracking-wide text-muted">
                      {new Date(it.criado_em as string).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-xs leading-relaxed text-muted">
                    {it.conteudo}
                  </p>
                </article>
              ))}
            </div>

            {totalPages > 1 && (
              <nav className="mt-6 flex items-center justify-between">
                <PageLink page={page - 1} disabled={page <= 1} label="← anterior" />
                <span className="mono text-xs text-muted">
                  {page} / {totalPages}
                </span>
                <PageLink
                  page={page + 1}
                  disabled={page >= totalPages}
                  label="próxima →"
                />
              </nav>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function PageLink({
  page,
  disabled,
  label,
}: {
  page: number;
  disabled: boolean;
  label: string;
}) {
  if (disabled) {
    return <span className="mono text-xs text-muted/40">{label}</span>;
  }
  return (
    <Link
      href={`/portfolio?page=${page}`}
      className="mono rounded-md border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:border-ember/40 hover:text-fg"
    >
      {label}
    </Link>
  );
}
