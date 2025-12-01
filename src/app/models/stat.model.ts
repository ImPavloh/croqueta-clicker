/**
 * Interfaz que define la estructura de una estadística mostrada en el panel de stats.
 */
export interface StatModel {
  /** Identificador único */
  id: string;

  /** Título mostrado en la UI (clave de traducción) */
  title: string;

  /** Referencia al valor en PlayerStats */
  key: string;

  /** Nombre del icono */
  icon: string;

  /** Formato de presentación del valor */
  format: 'number' | 'percentage' | 'time';

  /** Texto opcional para tooltip o ayuda */
  description?: string;
}
