/**
 * Tipo unión que define los diferentes requisitos para desbloquear una skin.
 */
export type UnlockRequirement =
  | { type: 'none' }
  | { type: 'level'; value: number }
  | { type: 'croquetas'; value: number }
  | { type: 'exp'; value: number }
  | { type: 'achievement'; id: string };

/**
 * Interfaz que define la estructura de una skin (apariencia) de la croqueta.
 */
export interface SkinModel {
  /** ID único de la skin */
  id: number;

  /** Rareza de la skin (común, rara, épica, legendaria) */
  rarity?: string;

  /** Orden de visualización en la lista */
  order?: number;

  /** Nombre de la skin (clave de traducción) */
  name: string;

  /** Descripción de la skin (clave de traducción) */
  description: string;

  /** Ruta de la imagen de la skin */
  image: string;

  /** Estado de desbloqueo */
  unlocked?: boolean;

  /** Imagen usada para las partículas de esta skin */
  particleImage?: string;

  /** Label personalizado del contador (ej: "patatas" en vez de "croquetas") */
  counterLabel?: string;

  /** Requisito para desbloquear la skin */
  unlockRequirement?: UnlockRequirement;

  /** Fondo personalizado para esta skin */
  background?: string;

  /** Timestamp de cuándo se usó por primera vez */
  timestamp?: number;
}
