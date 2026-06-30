import { z } from "zod";
import { CAPABILITY_LEVELS } from "@/lib/domain/types";

// Schema dos arquivos de módulo (docs/academy/**/module-XX.md).
// É o CONTRATO. O loader valida contra isto; quebrou o contrato, falha alto e
// claro, nunca renderiza um módulo torto.

const levelEnum = z.enum(CAPABILITY_LEVELS);

// ---- Frontmatter (machine-readable, no topo do .md) ----
export const frontmatterSchema = z.object({
  id: z.string().min(1),
  cycle: z.number().int().positive(),
  order: z.number().int().positive(),
  title: z.string().min(1),
  rubric_version: z.string().min(1),
  prerequisites: z.array(z.string()).default([]),
  capabilities: z
    .array(
      z.object({
        id: z.string().min(1),
        target_level: levelEnum,
      }),
    )
    .min(1),
  gate: z.object({
    capability: z.string().min(1),
    min_level: levelEnum,
  }),
  leak_tags: z.array(z.string()).default([]),
});

// ---- Bloco de avaliação (machine-readable, ```yaml dentro do corpo) ----
const evidenceObjectiveItem = z.object({
  key: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(["count", "boolean"]),
});

const evidenceSubjectiveItem = z.object({
  key: z.string().min(1),
  description: z.string().min(1),
});

export const evaluationBlockSchema = z.object({
  evaluation: z.object({
    rubric_version: z.string().min(1),
    capabilities: z
      .array(
        z.object({
          id: z.string().min(1),
          levels: z.object({
            awareness: z.string().min(1),
            assisted_execution: z.string().min(1),
            independent_execution: z.string().min(1),
            mastery: z.string().min(1),
          }),
          evidence_checklist: z.object({
            objective: z.array(evidenceObjectiveItem).default([]),
            subjective: z.array(evidenceSubjectiveItem).default([]),
          }),
        }),
      )
      .min(1),
    gate: z.object({
      capability: z.string().min(1),
      min_level: levelEnum,
      note: z.string().optional(),
    }),
  }),
});

// ---- Prompts do AI Guide (machine-readable, ```yaml dentro do corpo) ----
export const aiGuidePromptsBlockSchema = z.object({
  ai_guide_prompts: z.object({
    onboarding: z.string().min(1),
    mentoring: z.string().min(1),
    evaluation: z.string().min(1),
    feedback: z.string().min(1),
    leak_logging: z.string().min(1),
  }),
});

export type Frontmatter = z.infer<typeof frontmatterSchema>;
export type EvaluationBlock = z.infer<typeof evaluationBlockSchema>["evaluation"];
export type AiGuidePrompts = z.infer<
  typeof aiGuidePromptsBlockSchema
>["ai_guide_prompts"];

// ---- O módulo já montado e tipado (o que o resto do app consome) ----
export type LoadedModule = {
  frontmatter: Frontmatter;
  evaluation: EvaluationBlock;
  aiGuidePrompts: AiGuidePrompts;
  // Seções markdown legíveis (heading -> conteúdo), pra renderizar na tela.
  sections: Record<string, string>;
  // O markdown bruto do corpo, caso algo precise.
  rawBody: string;
};
