/**
 * Interfaz que define la estructura de un productor automático de croquetas.
 */
export interface ProducerModel {
  /** ID único del productor */
  id: number;

  /** Nombre del productor (clave de traducción) */
  name: string;

  /** Ruta de la imagen del productor */
  image: string;

  /** Precio base (primera compra) */
  priceBase: number;

  /** Multiplicador de precio por cada compra */
  priceMult: number;

  /** Croquetas base por segundo */
  pointsBase: number;

  /** Incremento de croquetas por segundo por cada unidad adicional */
  pointsSum: number;

  /** Descripción del productor (clave de traducción) */
  description: string;

  /** Nivel requerido para desbloquear */
  level: number;

  /** Experiencia otorgada al comprar */
  exp: number;
}
