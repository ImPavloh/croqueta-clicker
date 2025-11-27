/**
 * Constantes globales de la aplicación
 */

/**
 * Prefijo para todas las claves de localStorage
 * (para evitar colisiones con otras webs o extensiones)
 */
export const GAME_PREFIX = 'croquetaclicker_';

/**
 * Configuración de eventos
 */
export const EVENT_CHECK_INTERVAL_MS = 20000; // Cada 20 segundos, comprueba si debe aparecer un evento
export const EVENT_FADE_OUT_MS = 500;

/**
 * Configuración del evento de la Croqueta Dorada (bonificación de multiplicador)
 */
export const GOLDEN_EVENT_SPAWN_CHANCE = 0.05;
export const GOLDEN_EVENT_LIFETIME_MS = 5000;
export const GOLDEN_EVENT_BONUS_DURATION_MS = 30000;
export const GOLDEN_EVENT_BONUS_MULTIPLIER = 2;

/**
 * Configuración del evento de la Croqueta Quemada (penalización)
 */
export const BURNT_EVENT_SPAWN_CHANCE = 0.07;
export const BURNT_EVENT_LIFETIME_MS = 8000;
export const BURNT_EVENT_PENALTY_DURATION_MS = 20000;
export const BURNT_EVENT_PENALTY_MULTIPLIER = 0.5;

/**
 * Configuración del evento de bonus (recompensa de tiempo)
 */
export const BONUS_EVENT_SPAWN_CHANCE = 0.02;
export const BONUS_EVENT_LIFETIME_MS = 5000;
export const BONUS_EVENT_TIME_REWARD_S = 900; // 15 minutos de producción
