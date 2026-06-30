import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { loadAllModules } from "@/lib/modules/loader";
import { ensureProgressBootstrap } from "./progress";
import type {
  CapabilityLevel,
  ModuleStatus,
} from "@/lib/domain/types";

export type CapabilityState = {
  id: string;
  level: CapabilityLevel;
  intensity: number;
  cooled: boolean;
};

export type ModuleView = {
  id: string;
  title: string;
  cycle: number;
  order: number;
  status: ModuleStatus;
  gateCapability: string;
  capabilities: { id: string; target_level: CapabilityLevel }[];
};

export type BuilderState = {
  modules: ModuleView[];
  capabilities: Record<string, CapabilityState>;
  nextStep: { moduleId: string; title: string; status: ModuleStatus } | null;
  reinforcements: string[];
  portfolioCount: number;
};

// Agrega TODO o estado do Builder pras telas (Cockpit, Trilha, Skill Tree,
// Portfólio). Uma fonte só, derivada do banco (verdade) + dos arquivos (conteúdo).
export async function getBuilderState(
  supabase: SupabaseClient,
  builderId: string,
): Promise<BuilderState> {
  await ensureProgressBootstrap(supabase, builderId);

  const modules = await loadAllModules();

  const [{ data: progress }, { data: caps }, { data: leaks }, { count }] =
    await Promise.all([
      supabase
        .from("module_progress")
        .select("module_id, status")
        .eq("builder_id", builderId),
      supabase
        .from("capabilities")
        .select("capability_id, level, intensity, cooled")
        .eq("builder_id", builderId),
      supabase.from("leak_logs").select("leak_tag, module_id").eq("builder_id", builderId),
      supabase
        .from("portfolio_items")
        .select("id", { count: "exact", head: true })
        .eq("builder_id", builderId),
    ]);

  const statusById = new Map<string, ModuleStatus>(
    (progress ?? []).map((p) => [p.module_id as string, p.status as ModuleStatus]),
  );

  const capabilities: Record<string, CapabilityState> = {};
  for (const c of caps ?? []) {
    capabilities[c.capability_id as string] = {
      id: c.capability_id as string,
      level: c.level as CapabilityLevel,
      intensity: c.intensity as number,
      cooled: c.cooled as boolean,
    };
  }

  const moduleViews: ModuleView[] = modules.map((m) => ({
    id: m.frontmatter.id,
    title: m.frontmatter.title,
    cycle: m.frontmatter.cycle,
    order: m.frontmatter.order,
    status: statusById.get(m.frontmatter.id) ?? "locked",
    gateCapability: m.frontmatter.gate.capability,
    capabilities: m.frontmatter.capabilities,
  }));

  // Próximo passo: in_progress primeiro, depois available, menor cycle/order.
  const ordered = [...moduleViews].sort(
    (a, b) => a.cycle - b.cycle || a.order - b.order,
  );
  const next =
    ordered.find((m) => m.status === "in_progress") ??
    ordered.find((m) => m.status === "available") ??
    null;

  // Reforço dirigido: leak_tag que apareceu em 2+ módulos diferentes.
  const modsByTag = new Map<string, Set<string>>();
  for (const l of leaks ?? []) {
    const set = modsByTag.get(l.leak_tag as string) ?? new Set<string>();
    set.add(l.module_id as string);
    modsByTag.set(l.leak_tag as string, set);
  }
  const reinforcements = [...modsByTag.entries()]
    .filter(([, set]) => set.size >= 2)
    .map(([tag]) => tag);

  return {
    modules: moduleViews,
    capabilities,
    nextStep: next
      ? { moduleId: next.id, title: next.title, status: next.status }
      : null,
    reinforcements,
    portfolioCount: count ?? 0,
  };
}
