import { TutorialMessage } from '@models/tutorial.model';

// Croquetita = tutorial / mensajes de ayuda y consejos durante el juego
export const TUTORIAL_MESSAGES: TutorialMessage[] = [
  // ============================================================
  // BIENVENIDA Y PRIMEROS PASOS (0-100 croquetas)
  // ============================================================
  {
    id: 'welcome',
    minPoints: 0,
    maxPoints: 0,
    message: 'tutorial.welcome',
    priority: 1,
    autoShow: true,
    category: 'welcome',
  },
  {
    id: 'first_click',
    minPoints: 1,
    maxPoints: 5,
    message: 'tutorial.first_click',
    priority: 2,
    autoShow: true,
    category: 'tutorial',
  },
  {
    id: 'keep_clicking',
    minPoints: 5,
    maxPoints: 15,
    message: 'tutorial.keep_clicking',
    priority: 15,
    autoShow: false,
    category: 'tutorial',
  },
  {
    id: 'first_producer',
    minPoints: 50,
    maxPoints: 75,
    message: 'tutorial.first_producer',
    priority: 4,
    autoShow: true,
    category: 'tutorial',
  },
  {
    id: 'first_upgrade',
    minPoints: 100,
    maxPoints: 125,
    message: 'tutorial.first_upgrade',
    priority: 5,
    category: 'tips',
  },

  // ============================================================
  // EARLY GAME - Primeros productores (100-10k)
  // ============================================================
  {
    id: 'producers_tip',
    minPoints: 200,
    maxPoints: 500,
    message: 'tutorial.producers_tip',
    priority: 15,
    category: 'tips',
  },
  {
    id: 'keep_upgrading',
    minPoints: 500,
    maxPoints: 1000,
    message: 'tutorial.keep_upgrading',
    priority: 20,
    autoShow: true,
    category: 'encouragement',
  },
  {
    id: 'thousand_milestone',
    minPoints: 1000,
    maxPoints: 2000,
    message: 'tutorial.thousand_milestone',
    priority: 25,
    category: 'milestone',
  },
  {
    id: 'balance_tip',
    minPoints: 2000,
    maxPoints: 5000,
    message: 'tutorial.balance_tip',
    priority: 30,
    category: 'tips',
  },
  {
    id: 'five_thousand',
    minPoints: 5000,
    maxPoints: 10000,
    message: 'tutorial.five_thousand',
    priority: 35,
    category: 'encouragement',
  },

  // ============================================================
  // MID GAME - Crecimiento exponencial (10k-1M)
  // ============================================================
  {
    id: 'ten_thousand',
    minPoints: 10000,
    maxPoints: 25000,
    message: 'tutorial.ten_thousand',
    priority: 40,
    category: 'milestone',
  },
  {
    id: 'skins_unlock',
    minPoints: 25000,
    maxPoints: 50000,
    message: 'tutorial.skins_unlock',
    priority: 45,
    category: 'tutorial',
  },
  {
    id: 'fifty_thousand',
    minPoints: 50000,
    maxPoints: 100000,
    message: 'tutorial.fifty_thousand',
    priority: 50,
    autoShow: true,
    category: 'encouragement',
  },
  {
    id: 'hundred_thousand',
    minPoints: 100000,
    maxPoints: 250000,
    message: 'tutorial.hundred_thousand',
    priority: 55,
    category: 'milestone',
  },
  {
    id: 'quarter_million',
    minPoints: 250000,
    maxPoints: 500000,
    message: 'tutorial.quarter_million',
    priority: 60,
    category: 'humor',
  },
  {
    id: 'half_million',
    minPoints: 500000,
    maxPoints: 1000000,
    message: 'tutorial.half_million',
    priority: 65,
    category: 'tips',
  },

  // ============================================================
  // MILLONARIO - Primeros millones (1M-100M)
  // ============================================================
  {
    id: 'first_million',
    minPoints: 1000000,
    maxPoints: 2500000,
    message: 'tutorial.first_million',
    priority: 70,
    autoShow: true,
    category: 'milestone',
  },
  {
    id: 'million_advice',
    minPoints: 2500000,
    maxPoints: 5000000,
    message: 'tutorial.million_advice',
    priority: 75,
    category: 'tips',
  },
  {
    id: 'five_million',
    minPoints: 5000000,
    maxPoints: 10000000,
    message: 'tutorial.five_million',
    priority: 80,
    category: 'humor',
  },
  {
    id: 'ten_million',
    minPoints: 10000000,
    maxPoints: 25000000,
    message: 'tutorial.ten_million',
    priority: 85,
    autoShow: true,
    category: 'encouragement',
  },
  {
    id: 'twenty_five_million',
    minPoints: 25000000,
    maxPoints: 50000000,
    message: 'tutorial.twenty_five_million',
    priority: 90,
    category: 'humor',
  },
  {
    id: 'fifty_million',
    minPoints: 50000000,
    maxPoints: 100000000,
    message: 'tutorial.fifty_million',
    priority: 95,
    category: 'tips',
  },

  // ============================================================
  // CIEN MILLONES - El cielo es el límite (100M-1B) ~ sigo usando billones en ingles (aunque en español signifique sean miles de millones, ya lo dije en el pipe short)
  // ============================================================
  {
    id: 'hundred_million',
    minPoints: 100000000,
    maxPoints: 250000000,
    message: 'tutorial.hundred_million',
    priority: 100,
    category: 'milestone',
  },
  {
    id: 'quarter_billion',
    minPoints: 250000000,
    maxPoints: 500000000,
    message: 'tutorial.quarter_billion',
    priority: 105,
    category: 'encouragement',
  },
  {
    id: 'half_billion',
    minPoints: 500000000,
    maxPoints: 1000000000,
    message: 'tutorial.half_billion',
    priority: 110,
    category: 'tips',
  },

  // ============================================================
  // BILLONARIO - Números astronómicos (1B-1T)
  // ============================================================
  {
    id: 'first_billion',
    minPoints: 1000000000,
    maxPoints: 5000000000,
    message: 'tutorial.first_billion',
    priority: 115,
    category: 'milestone',
  },
  {
    id: 'five_billion',
    minPoints: 5000000000,
    maxPoints: 10000000000,
    message: 'tutorial.five_billion',
    priority: 120,
    category: 'humor',
  },
  {
    id: 'ten_billion',
    minPoints: 10000000000,
    maxPoints: 50000000000,
    message: 'tutorial.ten_billion',
    priority: 125,
    category: 'encouragement',
  },
  {
    id: 'fifty_billion',
    minPoints: 50000000000,
    maxPoints: 100000000000,
    message: 'tutorial.fifty_billion',
    priority: 130,
    category: 'humor',
  },
  {
    id: 'hundred_billion',
    minPoints: 100000000000,
    maxPoints: 500000000000,
    message: 'tutorial.hundred_billion',
    priority: 135,
    category: 'milestone',
  },
  {
    id: 'half_trillion',
    minPoints: 500000000000,
    maxPoints: 1000000000000,
    message: 'tutorial.half_trillion',
    priority: 140,
    category: 'tips',
  },

  // ============================================================
  // TRILLONARIO - El infinito y más allá (1T-1Qa)
  // ============================================================
  {
    id: 'first_trillion',
    minPoints: 1000000000000,
    maxPoints: 10000000000000,
    message: 'tutorial.first_trillion',
    priority: 145,
    category: 'milestone',
  },
  {
    id: 'ten_trillion',
    minPoints: 10000000000000,
    maxPoints: 100000000000000,
    message: 'tutorial.ten_trillion',
    priority: 150,
    category: 'humor',
  },
  {
    id: 'hundred_trillion',
    minPoints: 100000000000000,
    maxPoints: 1000000000000000,
    message: 'tutorial.hundred_trillion',
    priority: 155,
    category: 'tips',
  },

  // ============================================================
  // CUADRILLONES Y MÁS ALLÁ (1Qa+)
  // ============================================================
  {
    id: 'first_quadrillion',
    minPoints: 1000000000000000,
    maxPoints: 1000000000000000000,
    message: 'tutorial.first_quadrillion',
    priority: 160,
    category: 'milestone',
  },
  {
    id: 'quintillion_zone',
    minPoints: 1000000000000000000,
    maxPoints: 1000000000000000000000,
    message: 'tutorial.quintillion_zone',
    priority: 165,
    category: 'humor',
  },
  {
    id: 'sextillion_warning',
    minPoints: 1000000000000000000000,
    maxPoints: 1000000000000000000000000,
    message: 'tutorial.sextillion_warning',
    priority: 170,
    category: 'warning',
  },
  {
    id: 'septillion_madness',
    minPoints: 1000000000000000000000000,
    maxPoints: 1000000000000000000000000000,
    message: 'tutorial.septillion_madness',
    priority: 175,
    category: 'milestone',
  },
  {
    id: 'octillion_gods',
    minPoints: 1000000000000000000000000000,
    maxPoints: 1000000000000000000000000000000,
    message: 'tutorial.octillion_gods',
    priority: 180,
    category: 'humor',
  },
  {
    id: 'nonillion_legend',
    minPoints: 1000000000000000000000000000000,
    maxPoints: 1000000000000000000000000000000000,
    message: 'tutorial.nonillion_legend',
    priority: 185,
    category: 'humor',
  },
  {
    id: 'decillion_limit',
    minPoints: 1000000000000000000000000000000000,
    maxPoints: 1000000000000000000000000000000000000,
    message: 'tutorial.decillion_limit',
    priority: 190,
    category: 'humor',
  },
  {
    id: 'more_and_beyond',
    minPoints: 1000000000000000000000000000000000000,
    message: 'tutorial.more_and_beyond',
    priority: 195,
    category: 'humor',
  },

  // ============================================================
  // CONSEJOS BASADOS EN CLICKS
  // ============================================================
  {
    id: 'clicks_1000',
    minClicks: 1000,
    maxClicks: 5000,
    message: 'tutorial.clicks_1000',
    priority: 210,
    category: 'achievement',
  },
  {
    id: 'clicks_10000',
    minClicks: 10000,
    maxClicks: 50000,
    message: 'tutorial.clicks_10000',
    priority: 215,
    category: 'humor',
  },
  {
    id: 'clicks_100000',
    minClicks: 100000,
    message: 'tutorial.clicks_100000',
    priority: 220,
    category: 'achievement',
  },

  // ============================================================
  // CONSEJOS BASADOS EN NIVEL
  // ============================================================
  {
    id: 'level_5',
    minLevel: 5,
    maxLevel: 10,
    message: 'tutorial.level_5',
    priority: 300,
    category: 'milestone',
  },
  {
    id: 'level_10',
    minLevel: 10,
    maxLevel: 20,
    message: 'tutorial.level_10',
    priority: 305,
    category: 'milestone',
  },
  {
    id: 'level_20',
    minLevel: 20,
    maxLevel: 30,
    message: 'tutorial.level_20',
    priority: 310,
    category: 'milestone',
  },
  {
    id: 'level_30',
    minLevel: 30,
    maxLevel: 50,
    message: 'tutorial.level_30',
    priority: 315,
    category: 'tips',
  },
  {
    id: 'level_50',
    minLevel: 50,
    message: 'tutorial.level_50',
    priority: 320,
    category: 'achievement',
  },
  {
    id: 'level_75',
    minLevel: 75,
    message: 'tutorial.level_75',
    priority: 325,
    category: 'achievement',
  },
  {
    id: 'level_100',
    minLevel: 100,
    message: 'tutorial.level_100',
    priority: 330,
    category: 'achievement',
  },
  {
    id: 'level_200',
    minLevel: 200,
    message: 'tutorial.level_200',
    priority: 335,
    category: 'achievement',
  },

  // ============================================================
  // TIPS GENERALES Y ESTRATEGIA
  // ============================================================
  {
    id: 'tip_efficiency',
    message: 'tutorial.tip_efficiency',
    priority: 400,
    category: 'tips',
  },
  {
    id: 'tip_combo',
    message: 'tutorial.tip_combo',
    priority: 401,
    category: 'tips',
  },
  {
    id: 'tip_achievements',
    message: 'tutorial.tip_achievements',
    priority: 402,
    category: 'tips',
  },
  {
    id: 'tip_patience',
    message: 'tutorial.tip_patience',
    priority: 403,
    category: 'tips',
  },
  {
    id: 'tip_active_vs_idle',
    message: 'tutorial.tip_active_vs_idle',
    priority: 404,
    category: 'tips',
  },

  // ============================================================
  // MENSAJES DE HUMOR Y MOTIVACIÓN
  // ============================================================
  {
    id: 'humor_addiction',
    message: 'tutorial.humor_addiction',
    priority: 500,
    category: 'humor',
  },
  {
    id: 'humor_grass',
    message: 'tutorial.humor_grass',
    priority: 501,
    category: 'humor',
  },
  {
    id: 'humor_sleep',
    message: 'tutorial.humor_sleep',
    priority: 502,
    category: 'humor',
  },
  {
    id: 'humor_family',
    message: 'tutorial.humor_family',
    priority: 503,
    category: 'humor',
  },
  {
    id: 'humor_finger',
    message: 'tutorial.humor_finger',
    priority: 504,
    category: 'humor',
  },
  {
    id: 'humor_croqueta_addict',
    message: 'tutorial.humor_croqueta_addict',
    priority: 505,
    category: 'humor',
  },
  {
    id: 'humor_infinite_clicks',
    message: 'tutorial.humor_infinite_clicks',
    priority: 506,
    category: 'humor',
  },
  {
    id: 'humor_croqueta_universe',
    message: 'tutorial.humor_croqueta_universe',
    priority: 507,
    category: 'humor',
  },
  {
    id: 'motivacion_1',
    message: 'tutorial.motivacion_1',
    priority: 510,
    category: 'encouragement',
  },
  {
    id: 'motivacion_2',
    message: 'tutorial.motivacion_2',
    priority: 511,
    category: 'encouragement',
  },
  {
    id: 'motivacion_3',
    message: 'tutorial.motivacion_3',
    priority: 512,
    category: 'encouragement',
  },

  // ============================================================
  // AYUDA GENERAL Y NAVEGACIÓN
  // ============================================================
  {
    id: 'help_navigation',
    message: 'tutorial.help_navigation',
    priority: 600,
    category: 'tutorial',
  },
  {
    id: 'help_achievements',
    message: 'tutorial.help_achievements',
    priority: 601,
    category: 'tutorial',
  },
  {
    id: 'help_skins',
    message: 'tutorial.help_skins',
    priority: 602,
    category: 'tutorial',
  },
  {
    id: 'general_help',
    message: 'tutorial.general_help',
    priority: 1000,
    category: 'tutorial',
  },
];
