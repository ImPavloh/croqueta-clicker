/**
 * Interfaz que define un mensaje del tutorial contextual.
 * Los mensajes se muestran según el progreso del jugador.
 */
export interface TutorialMessage {
  /** ID del mensaje */
  id: string;

  /** Puntos mínimos para mostrar el mensaje */
  minPoints?: number;

  /** Puntos máximos para mostrar el mensaje */
  maxPoints?: number;

  /** Clics mínimos para mostrar el mensaje */
  minClicks?: number;

  /** Clics máximos para mostrar el mensaje */
  maxClicks?: number;

  /** Nivel mínimo para mostrar el mensaje */
  minLevel?: number;

  /** Nivel máximo para mostrar el mensaje */
  maxLevel?: number;

  /** Clave de traducción del mensaje */
  message: string;

  /** Prioridad del mensaje (mayor = más prioritario) */
  priority: number;

  /** Si se muestra automáticamente o requiere acción del usuario */
  autoShow?: boolean;

  /** Categoría del mensaje */
  category:
    | 'welcome'
    | 'tutorial'
    | 'milestone'
    | 'tips'
    | 'encouragement'
    | 'humor'
    | 'warning'
    | 'achievement';
}
