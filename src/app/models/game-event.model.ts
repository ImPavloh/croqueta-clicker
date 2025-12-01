/**
 * Interfaz que define la estructura de un evento especial del juego
 * (croqueta dorada, quemada, bonus).
 */
export interface GameEvent {
  /** Identificador único del evento */
  id: number;

  /** Tipo de evento */
  type: 'golden' | 'burnt' | 'bonus';

  /** Duración del efecto en milisegundos */
  duration: number;

  /** Valor del efecto (multiplicador o bonus) */
  effect: number;

  /** Indica si el evento está actualmente activo */
  active: boolean;

  /** Indica si el evento ha sido generado (spawned) */
  spawned: boolean;

  /** Posición del evento en la pantalla */
  position: { x: number; y: number };

  /** Ruta de la imagen del evento */
  image: string;

  /** Tiempo restante del efecto (opcional) */
  remainingTime?: number;

  /** Estado de la animación del evento */
  state?: 'fading-in' | 'visible' | 'fading-out';
}
