import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { LoadedModule } from "@/lib/modules/schema";
import type { EvaluationContract } from "@/lib/ai/contract";
import {
  intensityForLevel,
  levelRank,
  type CapabilityLevel,
} from "@/lib/domain/types";

export type ApplyResult = {
  submissionId: string;
  evaluationId: string;
};

// Persiste o resultado de uma avaliação. Tudo sob o RLS do próprio Builder
// (inserts usam auth.uid()). Ordem importa: submissão -> avaliação -> efeitos.
export async function applyEvaluation(args: {
  supabase: SupabaseClient;
  builderId: string;
  mod: LoadedModule;
  missionId: string;
  submissionText: string;
  result: EvaluationContract;
}): Promise<ApplyResult> {
  const { supabase, builderId, mod, missionId, submissionText, result } = args;
  const moduleId = mod.frontmatter.id;

  // 1. Submissão (o entregável é DADO).
  const { data: sub, error: subErr } = await supabase
    .from("submissions")
    .insert({
      builder_id: builderId,
      module_id: moduleId,
      mission_id: missionId,
      conteudo: submissionText,
    })
    .select("id")
    .single();
  if (subErr || !sub) throw new Error(`Falha ao gravar submissão: ${subErr?.message}`);

  // 2. Avaliação (o JSON do contrato, validado).
  const { data: evalRow, error: evalErr } = await supabase
    .from("evaluations")
    .insert({
      submission_id: sub.id,
      builder_id: builderId,
      module_id: moduleId,
      rubric_version: result.rubric_version,
      resultado_json: result,
      gate_passed: result.gate_passed,
      revisado_por_humano: false,
    })
    .select("id")
    .single();
  if (evalErr || !evalRow)
    throw new Error(`Falha ao gravar avaliação: ${evalErr?.message}`);

  // 3. Capacidades — sobem por evidência, monotônico pra cima.
  const capIds = result.capabilities.map((c) => c.id);
  const { data: existingCaps } = await supabase
    .from("capabilities")
    .select("capability_id, level")
    .eq("builder_id", builderId)
    .in("capability_id", capIds.length ? capIds : ["__none__"]);

  const existingLevel = new Map<string, CapabilityLevel>(
    (existingCaps ?? []).map((c) => [
      c.capability_id as string,
      c.level as CapabilityLevel,
    ]),
  );

  const capRows = result.capabilities.map((c) => {
    const prev = existingLevel.get(c.id) ?? "none";
    // Não rebaixa: fica no maior entre o que já tinha e o avaliado agora.
    const level: CapabilityLevel =
      levelRank(c.level) >= levelRank(prev) ? c.level : prev;
    return {
      builder_id: builderId,
      capability_id: c.id,
      level,
      intensity: intensityForLevel(level),
      cooled: false,
      atualizado_em: new Date().toISOString(),
    };
  });
  if (capRows.length) {
    await supabase
      .from("capabilities")
      .upsert(capRows, { onConflict: "builder_id,capability_id" });
  }

  // 4. Leaks — registra cada tag.
  if (result.leak_tags.length) {
    await supabase.from("leak_logs").insert(
      result.leak_tags.map((tag) => ({
        builder_id: builderId,
        leak_tag: tag,
        module_id: moduleId,
      })),
    );
  }

  // 5. Reincidência de leak entre MÓDULOS diferentes -> arrefece a capacidade
  //    do gate e sinaliza reforço dirigido (a flag deriva dos leak_logs).
  for (const tag of result.leak_tags) {
    const { data: tagRows } = await supabase
      .from("leak_logs")
      .select("module_id")
      .eq("builder_id", builderId)
      .eq("leak_tag", tag);
    const distinctModules = new Set((tagRows ?? []).map((r) => r.module_id));
    if (distinctModules.size >= 2) {
      const coolCapId = mod.frontmatter.gate.capability;
      const cur = existingLevel.get(coolCapId) ?? "none";
      await supabase.from("capabilities").upsert(
        {
          builder_id: builderId,
          capability_id: coolCapId,
          level: cur,
          intensity: Math.max(0, intensityForLevel(cur) - 25),
          cooled: true,
          atualizado_em: new Date().toISOString(),
        },
        { onConflict: "builder_id,capability_id" },
      );
    }
  }

  // 6. Status do módulo: passou no gate -> 'passed' (capacidade comprovada).
  //    O DESBLOQUEIO do próximo módulo ainda depende de revisão humana.
  await supabase.from("module_progress").upsert(
    {
      builder_id: builderId,
      module_id: moduleId,
      status: result.gate_passed ? "passed" : "in_progress",
      ...(result.gate_passed ? { fechado_em: new Date().toISOString() } : {}),
    },
    { onConflict: "builder_id,module_id" },
  );

  // 7. Portfólio — o entregável vira evidência permanente quando passa.
  if (result.gate_passed) {
    await supabase.from("portfolio_items").insert({
      builder_id: builderId,
      module_id: moduleId,
      titulo: `${mod.frontmatter.title} — ${mod.frontmatter.gate.capability}`,
      conteudo: submissionText,
    });
  }

  return { submissionId: sub.id, evaluationId: evalRow.id };
}
