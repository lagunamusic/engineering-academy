import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getBuilderState } from "@/lib/builder/state";
import { AppNav } from "@/components/AppNav";
import { SkillTree } from "@/components/SkillTree";

export const dynamic = "force-dynamic";

export default async function SkillTreePage() {
  if (!isSupabaseConfigured()) redirect("/login");

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const state = await getBuilderState(supabase, user.id);
  const anyEarned = Object.values(state.capabilities).some(
    (c) => c.level !== "none",
  );

  return (
    <main className="relative min-h-screen">
      <AppNav email={user.email} />
      <div className="relative mx-auto max-w-3xl px-6 pb-16">
        <header className="py-8">
          <h1 className="text-2xl font-semibold text-fg">Skill Tree</h1>
          <p className="mt-2 text-sm text-muted">
            Reflexo da sua capacidade real. Cada nó acende por evidência — não dá
            pra clicar e pular etapa. {!anyEarned && "Ainda apagada: prove no Módulo 01 e veja acender."}
          </p>
        </header>

        {/* Legenda */}
        <div className="mb-8 flex flex-wrap gap-x-6 gap-y-2">
          {[
            { label: "Awareness", op: 0.25 },
            { label: "Assisted", op: 0.5 },
            { label: "Independent", op: 0.75 },
            { label: "Mastery", op: 1 },
          ].map((l) => (
            <span key={l.label} className="mono flex items-center gap-2 text-[11px] text-muted">
              <span
                className="h-3 w-3 rounded-full bg-ember"
                style={{ opacity: l.op }}
              />
              {l.label}
            </span>
          ))}
          <span className="mono flex items-center gap-2 text-[11px] text-muted">
            <span className="h-3 w-3 rounded-full bg-cooled" />
            arrefecida (leak)
          </span>
        </div>

        <SkillTree modules={state.modules} capabilities={state.capabilities} />
      </div>
    </main>
  );
}
