/**
 * Interfaz que define la estructura de un logro del juego.
 */
export interface AchievementModel {
  /** Identificador único del logro */
  id: string;

  /** Título del logro (clave de traducción) */
  title: string;

  /** Descripción del logro (clave de traducción). Si es secreto, se omite hasta desbloquearlo */
  description: string;

  /** Ruta del icono del logro */
  icon: string;

  /** true = logro secreto (no mostrar la descripción hasta desbloquearlo) */
  secret?: boolean;
}
