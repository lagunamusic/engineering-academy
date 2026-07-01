import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getModuleById } from "@/lib/modules/loader";
import { ensureProgressBootstrap } from "@/lib/builder/progress";
import { MissionWorkspace } from "@/components/mission/MissionWorkspace";

const OPENER =
  "Não vou te explicar o que é engenharia. Vou te fazer fazer. Me conta: que decisão você toma no automático, todo dia, sem nem pensar? Pode ser qualquer uma.";

export default async function MissionPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  if (!isSupabaseConfigured()) redirect("/login");
  const { moduleId } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const mod = await getModuleById(moduleId);
  if (!mod) notFound();

  // Garante o progresso e checa acesso (módulo travado não entra).
  await ensureProgressBootstrap(supabase, user.id);
  const { data: progress } = await supabase
    .from("module_progress")
    .select("status")
    .eq("builder_id", user.id)
    .eq("module_id", moduleId)
    .maybeSingle();

  if (progress?.status === "locked") {
    redirect("/trilha");
  }

  // Marca como iniciado (sem rebaixar quem já passou).
  if (progress?.status === "available") {
    await supabase
      .from("module_progress")
      .update({ status: "in_progress", iniciado_em: new Date().toISOString() })
      .eq("builder_id", user.id)
      .eq("module_id", moduleId);
  }

  // Rede de segurança: a última submissão (se houver) vira fallback do editor,
  // pra um resultado negativo nunca deixar o Builder começar do zero.
  const { data: lastSub } = await supabase
    .from("submissions")
    .select("conteudo")
    .eq("builder_id", user.id)
    .eq("module_id", moduleId)
    .order("criado_em", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <main className="relative min-h-screen">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-20" />
      <div className="relative">
        <MissionWorkspace
          moduleId={mod.frontmatter.id}
          title={mod.frontmatter.title}
          cycle={mod.frontmatter.cycle}
          order={mod.frontmatter.order}
          briefing={mod.sections.briefing}
          bossMission={mod.sections.boss_mission}
          miniMissions={mod.sections.mini_missions}
          knowledge={mod.sections.knowledge}
          capabilities={mod.frontmatter.capabilities}
          opener={OPENER}
          initialDraft={lastSub?.conteudo ?? undefined}
        />
      </div>
    </main>
  );
}
