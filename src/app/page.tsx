import Link from "next/link";

const CYCLES = [
  { code: "I", name: "Engineering Foundations", desc: "pensar como engenheiro" },
  { code: "II", name: "Software Engineering", desc: "construir software de verdade" },
  { code: "III", name: "Modern Engineering", desc: "sistemas em produção e escala" },
  { code: "IV", name: "AI Engineering", desc: "construir com e sobre IA" },
];

const PRINCIPLES = [
  "Competência acima de consumo",
  "Build antes de explicar",
  "Evidência destrava progresso",
  "A IA aumenta autonomia, nunca entrega a resposta",
];

export default function Landing() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Grid de fundo sutil + brilho ember no topo */}
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[680px] -translate-x-1/2 rounded-full bg-ember/10 blur-[120px]" />

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col px-6">
        {/* Nav */}
        <nav className="flex items-center justify-between py-6">
          <div className="flex items-center gap-3">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-ember text-sm font-bold text-bg shadow-glow-soft">
              ⚡
            </span>
            <span className="mono text-sm font-medium tracking-[0.2em] text-fg">
              ENGINEERING ACADEMY
            </span>
          </div>
          <Link
            href="/login"
            className="mono rounded-md border border-border px-4 py-2 text-xs tracking-wide text-muted transition-colors hover:border-ember/50 hover:text-fg"
          >
            ENTRAR
          </Link>
        </nav>

        {/* Hero */}
        <section className="flex flex-1 flex-col justify-center py-16">
          <p className="mono mb-5 text-xs tracking-[0.25em] text-ember">
            APRENDA CONSTRUINDO · AVANCE POR EVIDÊNCIA
          </p>

          <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-[1.1] tracking-tight text-fg sm:text-5xl md:text-6xl">
            Você não vai{" "}
            <span className="text-muted line-through decoration-border decoration-2">
              assistir
            </span>{" "}
            engenharia.
            <br />
            Você vai <span className="text-ember text-glow">construí-la.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            Uma academia onde você aprende fazendo, e só avança quando{" "}
            <span className="text-fg">prova por evidência</span> que desenvolveu
            uma capacidade. Um mentor de IA provoca, avalia o que você entrega
            contra uma rubrica fechada, aponta a fraqueza e te dá a próxima ação.
            Sem badge, sem streak, sem número de vaidade.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/login"
              className="group relative inline-flex items-center gap-2 rounded-md bg-ember px-6 py-3 text-sm font-semibold text-bg transition-all hover:shadow-glow hover:brightness-110"
            >
              Começar o Módulo 01
              <span className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </Link>
            <span className="mono text-xs tracking-wide text-muted">
              pré-código · nada pra instalar pra começar
            </span>
          </div>
        </section>

        {/* Os 4 ciclos — escada de maturidade, não de tecnologia */}
        <section className="border-t border-border py-12">
          <p className="mono mb-6 text-xs tracking-[0.2em] text-muted">
            A ESCADA DE MATURIDADE
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CYCLES.map((c) => (
              <div
                key={c.code}
                className="rounded-lg border border-border bg-surface p-5 transition-colors hover:border-ember/30 hover:bg-surface-high"
              >
                <span className="mono text-2xl font-bold text-ember/80">
                  {c.code}
                </span>
                <h3 className="mt-2 text-sm font-medium text-fg">{c.name}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted">{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Princípios — o OS (imutável) */}
        <section className="border-t border-border py-12">
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {PRINCIPLES.map((p) => (
              <span
                key={p}
                className="mono flex items-center gap-2 text-xs text-muted"
              >
                <span className="text-ember">▸</span>
                {p}
              </span>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-auto border-t border-border py-6">
          <p className="mono text-xs tracking-wide text-muted">
            MVP · primeiro produto do projeto Prometheus
          </p>
        </footer>
      </div>
    </main>
  );
}
