import Decimal from 'break_infinity.js';

/**
 * Interfaz que define la estructura de una mejora de puntos por clic.
 */
export interface UpgradeModel {
  /** ID único de la mejora */
  id: number;

  /** Nombre de la mejora (clave de traducción) */
  name: string;

  /** Ruta de la imagen de la mejora */
  image: string;

  /** Precio de la mejora (puede ser number o Decimal) */
  price: number | Decimal;

  /** Bonus de puntos por clic que otorga */
  clicks: number;

  /** Nivel requerido para desbloquear */
  level: number;

  /** Experiencia otorgada al comprar */
  exp: number;
}
