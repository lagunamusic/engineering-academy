import { z } from "zod";
import { CAPABILITY_LEVELS } from "@/lib/domain/types";

// O CONTRATO da avaliação. A IA SEMPRE retorna exatamente isto. Se vier
// malformado, o backend rejeita e re-tenta — nunca quebra a tela.

const levelEnum = z.enum(CAPABILITY_LEVELS);

export const evaluationContractSchema = z.object({
  rubric_version: z.string().min(1),
  capabilities: z
    .array(
      z.object({
        id: z.string().min(1),
        level: levelEnum,
        // evidence é um mapa flexível: chaves objetivas (count/boolean) +
        // subjetivas (boolean). Validamos os tipos básicos.
        evidence: z.record(z.string(), z.union([z.boolean(), z.number()])),
      }),
    )
    .min(1),
  gate_passed: z.boolean(),
  blocking_gap: z
    .object({
      capability: z.string().min(1),
      what_is_missing: z.string().min(1),
    })
    .nullable(),
  next_micro_mission: z.string().nullable(),
  leak_tags: z.array(z.string()).default([]),
  feedback: z.object({
    did_well: z.string().min(1),
    to_improve: z.string().min(1),
    why: z.string().min(1),
  }),
});

export type EvaluationContract = z.infer<typeof evaluationContractSchema>;

// Extrai o primeiro objeto JSON de um texto (a IA às vezes embrulha em ```json).
export function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("Nenhum objeto JSON encontrado na resposta da IA.");
  }
  return JSON.parse(candidate.slice(start, end + 1));
}
