/**
 * Interfaz que define un paso del tutorial superpuesto al inicio del juego.
 */
export interface TutorialOverlayStep {
  /** ID del paso del tutorial */
  id: string;

  /** Clave de traducción del título */
  titleKey: string;

  /** Clave de traducción del cuerpo del mensaje */
  bodyKey: string;

  /** Ruta de imagen genérica (opcional) */
  image?: string;

  /** Rutas de imagen por idioma (opcional) */
  localizedImages?: Record<string, string>;
}
