import { StatModel } from 'app/models/stat.model';

export const STATS: StatModel[] = [
  // ============================================================
  // 🖱️ INTERACCIÓN - Estadísticas relacionadas con los clics
  // ============================================================
  {
    id: 'total_clicks',
    title: 'Clicks totales',
    key: 'totalClicks',
    icon: 'mouse',
    format: 'number',
    description: 'Cantidad total de clics realizados por el jugador.',
  },

  // ============================================================
  // ⏱️ TIEMPO DE JUEGO - Seguimiento de la duración de la sesión
  // ============================================================
  {
    id: 'time_playing',
    title: 'Tiempo jugado',
    key: 'timePlaying',
    icon: 'clock',
    format: 'time',
    description: 'Tiempo total que has pasado jugando.',
  },

  // ============================================================
  // 🧩 NIVEL Y EXPERIENCIA - Progreso del jugador
  // ============================================================
  {
    id: 'level_current',
    title: 'Nivel actual',
    key: 'level',
    icon: 'level-up',
    format: 'number',
    description: 'Nivel actual alcanzado por el jugador.',
  },
  {
    id: 'exp_progress',
    title: 'Progreso al siguiente nivel',
    key: 'expProgress',
    icon: 'progress',
    format: 'percentage',
    description: 'Porcentaje de progreso hacia el próximo nivel.',
  },

  // ============================================================
  // 🥇 PRESTIGIO - Sistema de prestigio
  // ============================================================
  {
    id: 'prestige_level',
    title: 'Nivel de prestigio',
    key: 'prestigeLevel',
    icon: 'level-up',
    format: 'number',
    description: 'Cantidad de veces que has hecho prestigio.',
  },
  {
    id: 'prestige_multiplier',
    title: 'Multiplicador de prestigio',
    key: 'prestigeMultiplier',
    icon: 'progress',
    format: 'percentage',
    description: 'Bonus de producción por Croquetas Doradas acumuladas.',
  },
];
