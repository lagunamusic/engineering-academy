import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { loadAllModules } from "@/lib/modules/loader";
import type { ModuleStatus } from "@/lib/domain/types";

// Garante uma linha de module_progress pra cada módulo conhecido, com o status
// derivado dos prerequisites. Idempotente: pode rodar a cada visita sem estragar
// nada. Nunca rebaixa quem já está in_progress ou passed.
export async function ensureProgressBootstrap(
  supabase: SupabaseClient,
  builderId: string,
): Promise<void> {
  const modules = await loadAllModules();

  const { data: existing } = await supabase
    .from("module_progress")
    .select("module_id, status")
    .eq("builder_id", builderId);

  const statusById = new Map<string, ModuleStatus>(
    (existing ?? []).map((r) => [r.module_id as string, r.status as ModuleStatus]),
  );

  const rowsToUpsert: {
    builder_id: string;
    module_id: string;
    status: ModuleStatus;
  }[] = [];

  for (const m of modules) {
    const id = m.frontmatter.id;
    const current = statusById.get(id);
    if (current === "in_progress" || current === "passed") continue;

    // Disponível só quando TODOS os prerequisites estão 'passed'.
    const prereqsPassed = m.frontmatter.prerequisites.every(
      (p) => statusById.get(p) === "passed",
    );
    const desired: ModuleStatus = prereqsPassed ? "available" : "locked";

    if (current !== desired) {
      rowsToUpsert.push({ builder_id: builderId, module_id: id, status: desired });
    }
  }

  if (rowsToUpsert.length > 0) {
    await supabase
      .from("module_progress")
      .upsert(rowsToUpsert, { onConflict: "builder_id,module_id" });
  }
}
