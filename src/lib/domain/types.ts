// Tipos de domínio compartilhados entre back e front.
// A "pedra": valores fixos, sem ambiguidade. Mudou aqui, muda no mundo todo.

export const CAPABILITY_LEVELS = [
  "none",
  "awareness",
  "assisted_execution",
  "independent_execution",
  "mastery",
] as const;

export type CapabilityLevel = (typeof CAPABILITY_LEVELS)[number];

export const MODULE_STATUSES = [
  "locked",
  "available",
  "in_progress",
  "passed",
] as const;

export type ModuleStatus = (typeof MODULE_STATUSES)[number];

// Intensidade (0..100) deriva do nível. A Skill Tree usa isso pro glow do nó:
// Awareness fraco e apagado -> Mastery brilho cheio.
const INTENSITY_BY_LEVEL: Record<CapabilityLevel, number> = {
  none: 0,
  awareness: 25,
  assisted_execution: 50,
  independent_execution: 75,
  mastery: 100,
};

export function intensityForLevel(level: CapabilityLevel): number {
  return INTENSITY_BY_LEVEL[level];
}

// Ordem dos níveis pra comparar "atingiu o corte?".
export function levelRank(level: CapabilityLevel): number {
  return CAPABILITY_LEVELS.indexOf(level);
}

// O nível atingido bate (ou supera) o mínimo exigido pelo gate?
export function meetsLevel(
  achieved: CapabilityLevel,
  required: CapabilityLevel,
): boolean {
  return levelRank(achieved) >= levelRank(required);
}

// Rótulo legível pra UI (curto, técnico).
export const LEVEL_LABEL: Record<CapabilityLevel, string> = {
  none: "—",
  awareness: "Awareness",
  assisted_execution: "Assisted",
  independent_execution: "Independent",
  mastery: "Mastery",
};
