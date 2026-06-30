import type { EvaluationBlock } from "@/lib/modules/schema";

// Resolve os itens OBJETIVOS do checklist por regra determinística, no backend,
// antes de chamar a IA. Barato e repetível. A IA recebe esses valores prontos.
//
// NOTA HONESTA: contar edge case em texto livre é heurística, não verdade
// absoluta. O backstop é a REVISÃO HUMANA no gate (revisado_por_humano), que o
// produto já prevê. Heurística aqui erra pra um lado seguro e o humano confere.

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function hasAny(haystack: string, needles: string[]): boolean {
  return needles.some((n) => haystack.includes(n));
}

// Caminho ENTÃO e caminho SENÃO ambos presentes.
function bothPathsCovered(norm: string): boolean {
  const hasThen = hasAny(norm, ["entao", "then", "->", "=>"]);
  const hasElse = hasAny(norm, ["senao", "else", "caso contrario", "caso nao"]);
  return hasThen && hasElse;
}

// Existe frase justificando qual regra/entrada foi cortada e por quê.
function cutJustified(norm: string): boolean {
  const cutVerb = hasAny(norm, [
    "cortei",
    "cortar",
    "corto",
    "removi",
    "remover",
    "descartei",
    "joguei fora",
    "deixei de fora",
    "ignorei",
    "tirei",
    "nao importa",
    "nao muda o resultado",
    "nao muda a saida",
    "irrelevante",
  ]);
  const justifier = hasAny(norm, [
    "porque",
    "por que",
    "pois",
    "ja que",
    "uma vez que",
    "visto que",
  ]);
  return cutVerb && justifier;
}

// Conta edge cases que o próprio Builder listou.
function countEdgeCases(norm: string, raw: string): number {
  const EDGE_KEYS = ["edge case", "edge-case", "caso de borda", "caso extremo", "casos extremos", "edge cases"];
  const firstIdx = EDGE_KEYS.map((k) => norm.indexOf(k)).filter((i) => i >= 0);
  if (firstIdx.length === 0) return 0;

  // A partir da primeira menção, conta itens de lista (-, *, 1., 2., "caso").
  const start = Math.min(...firstIdx);
  const tail = raw.slice(start);
  const lines = tail.split("\n");
  let count = 0;
  for (const line of lines) {
    if (/^\s*(?:[-*•]|\d+[.)]|caso\b)/i.test(line)) count++;
  }
  // Se não achou itens de lista mas há menções, conta as menções como piso.
  if (count === 0) {
    count = EDGE_KEYS.reduce(
      (acc, k) => acc + norm.split(k).length - 1,
      0,
    );
  }
  return count;
}

export function resolveObjectiveEvidence(
  evaluation: EvaluationBlock,
  submission: string,
): Record<string, boolean | number> {
  const norm = normalize(submission);
  const out: Record<string, boolean | number> = {};

  const objective = evaluation.capabilities[0]?.evidence_checklist.objective ?? [];
  for (const item of objective) {
    switch (item.key) {
      case "both_paths_covered":
        out[item.key] = bothPathsCovered(norm);
        break;
      case "cut_justified_present":
        out[item.key] = cutJustified(norm);
        break;
      case "edge_cases_self_found":
        out[item.key] = countEdgeCases(norm, submission);
        break;
      default:
        // Chave objetiva desconhecida: marca o tipo correto, valor neutro.
        out[item.key] = item.type === "count" ? 0 : false;
    }
  }
  return out;
}
