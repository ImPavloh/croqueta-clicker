/**
 * Constantes globales de la aplicación
 */

/**
 * Prefijo para todas las claves de localStorage
 * (para evitar colisiones con otras webs o extensiones)
 */
export const GAME_PREFIX = 'croquetaclicker_';

/**
 * Configuración del evento de la Croqueta Dorada
 */
export const GOLDEN_CROQUETA_CHECK_INTERVAL_MS = 60000; // Cada 60 segundos, comprueba si debe aparecer
export const GOLDEN_CROQUETA_SPAWN_CHANCE = 0.12; // 12% de probabilidad en cada intervalo
export const GOLDEN_CROQUETA_LIFETIME_MS = 5000; // La croqueta dorada dura 5 segundos en pantalla
export const GOLDEN_CROQUETA_BONUS_DURATION_MS = 20000; // El bonus dura 20 segundos
export const GOLDEN_CROQUETA_BONUS_MULTIPLIER = 2; // Multiplica x2 los puntos
