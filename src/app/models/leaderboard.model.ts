export type LeaderboardMode = 'level' | 'contracts';

export interface LeaderboardMeta {
  prestige?: number;
  currentStreak?: number;
  bestStreak?: number;
  completedDays?: number;
  bonusClaims?: number;
  weeklyCompletedDays?: number;
}

/**
 * Interfaz base para una entrada en la tabla de clasificación.
 */
export interface LeaderboardRow {
  /** ID de la entrada (opcional, generado por la base de datos) */
  id?: number;

  /** ID del usuario */
  user_id: string;

  /** Nombre de usuario (puede ser null) */
  username?: string | null;

  /** Puntuación del usuario */
  score: number;

  /** Metadatos adicionales (incluye nivel de prestigio) */
  meta?: LeaderboardMeta | null;

  /** Fecha de creación de la entrada */
  created_at?: string | null;
}

/**
 * Interfaz extendida para una entrada de leaderboard con rango.
 */
export interface LeaderboardEntry extends LeaderboardRow {
  /** Posición en el ranking */
  rank?: number;
}
