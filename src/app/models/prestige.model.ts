export interface PrestigeState {
  level: number;
  goldenCroquetas: number;
  multiplier: number;
}

/** Nivel mínimo requerido para hacer prestige */
export const PRESTIGE_MIN_LEVEL = 50;

/** Multiplicador por cada croqueta dorada */
export const PRESTIGE_MULTIPLIER_PER_GC = 0.05;

/** Calcula cuántas croquetas doradas se ganan al prestigiar */
export function calculateGoldenCroquetas(currentLevel: number, currentPrestige: number): number {
  if (currentLevel < PRESTIGE_MIN_LEVEL) return 0;
  return Math.floor(Math.sqrt(currentLevel / PRESTIGE_MIN_LEVEL) * (1 + 0.1 * currentPrestige));
}

/** Calcula el multiplicador global de prestigio */
export function calculatePrestigeMultiplier(goldenCroquetas: number): number {
  return 1 + goldenCroquetas * PRESTIGE_MULTIPLIER_PER_GC;
}

/** Factor de reducción de XP requerida por nivel de prestigio (-2% por prestigio, cap -30%) */
export function calculateExpReductionFactor(prestigeLevel: number): number {
  const reduction = Math.min(0.3, prestigeLevel * 0.02);
  return 1 - reduction;
}
