import { TutorialMessage } from "@models/tutorial.model";

export const TUTORIAL_MESSAGES: TutorialMessage[] = [
  // ============================================================
  // BIENVENIDA Y PRIMEROS PASOS (0-100 croquetas)
  // ============================================================
  {
    id: 'welcome',
    minPoints: 0,
    maxPoints: 0,
    message:
      '¡Hola! Soy Croquetita ¡Bienvenido al mundo de las croquetas! Haz click en la croqueta grande para empezar tu aventura culinaria.',
    priority: 1,
    autoShow: true,
    category: 'welcome',
  },
  {
    id: 'first_click',
    minPoints: 1,
    maxPoints: 5,
    message:
      '¡Excelente! Acabas de cocinar tu primera croqueta. ¡Sigue clickeando para conseguir más!',
    priority: 2,
    autoShow: true,
    category: 'tutorial',
  },
  {
    id: 'keep_clicking',
    minPoints: 5,
    maxPoints: 15,
    message:
      '¡Vas muy bien! Cada click cuenta. Cuando tengas suficientes croquetas, podrás comprar productores automáticos.',
    priority: 3,
    autoShow: true,
    category: 'tutorial',
  },
  {
    id: 'first_producer',
    minPoints: 100,
    maxPoints: 150,
    message:
      '¡Ya puedes comprar tu primer productor! Ve al menú de la derecha y compra un "Click" que cocinará croquetas automáticamente.',
    priority: 4,
    autoShow: true,
    category: 'tutorial',
  },
  {
    id: 'first_upgrade',
    minPoints: 50,
    maxPoints: 100,
    message:
      'Consejo: Las mejoras aumentan la cantidad de croquetas por click. ¡Invierte en ellas sabiamente!',
    priority: 5,
    category: 'tips',
  },

  // ============================================================
  // EARLY GAME - Primeros productores (100-10k)
  // ============================================================
  {
    id: 'hundred_milestone',
    minPoints: 100,
    maxPoints: 200,
    message: '¡100 croquetas! Ya eres todo un cocinero. Las cosas se van a poner interesantes...',
    priority: 10,
    category: 'milestone',
  },
  {
    id: 'producers_tip',
    minPoints: 200,
    maxPoints: 500,
    message: 'Tip: Los productores más caros son más eficientes. ¡Ahorra para los mejores!',
    priority: 15,
    category: 'tips',
  },
  {
    id: 'keep_upgrading',
    minPoints: 500,
    maxPoints: 1000,
    message: 'Estás progresando genial. No olvides comprar mejoras para aumentar tu click power.',
    priority: 20,
    category: 'encouragement',
  },
  {
    id: 'thousand_milestone',
    minPoints: 1000,
    maxPoints: 2000,
    message: '¡1.000 croquetas! Esto es solo el comienzo. El imperio de las croquetas te espera.',
    priority: 25,
    category: 'milestone',
  },
  {
    id: 'balance_tip',
    minPoints: 2000,
    maxPoints: 5000,
    message:
      'Consejo de experto: Balancea tu inversión entre productores y mejoras para máxima eficiencia.',
    priority: 30,
    category: 'tips',
  },
  {
    id: 'five_thousand',
    minPoints: 5000,
    maxPoints: 10000,
    message: '¡5.000 croquetas! Tu cocina está en llamas (en el buen sentido).',
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
    message:
      '¡10K croquetas! Ya tienes una verdadera fábrica. ¿Sabías que puedes cambiar el aspecto de tu croqueta?',
    priority: 40,
    category: 'milestone',
  },
  {
    id: 'skins_unlock',
    minPoints: 25000,
    maxPoints: 50000,
    message:
      'Visita la sección de Skins para personalizar tu croqueta. ¡Hay muchos diseños geniales!',
    priority: 45,
    category: 'tutorial',
  },
  {
    id: 'fifty_thousand',
    minPoints: 50000,
    maxPoints: 100000,
    message: '50K... Esto se está poniendo serio. Pronto alcanzarás números que ni imaginabas.',
    priority: 50,
    category: 'encouragement',
  },
  {
    id: 'hundred_thousand',
    minPoints: 100000,
    maxPoints: 250000,
    message: '¡100.000 croquetas! Oficialmente eres un maestro croquetero.',
    priority: 55,
    category: 'milestone',
  },
  {
    id: 'quarter_million',
    minPoints: 250000,
    maxPoints: 500000,
    message: 'Un cuarto de millón... ¿Quién diría que hacer click podría ser tan adictivo?',
    priority: 60,
    category: 'humor',
  },
  {
    id: 'half_million',
    minPoints: 500000,
    maxPoints: 1000000,
    message: '500K croquetas. Revisa tus estadísticas, ¡seguro tienes logros desbloqueados!',
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
    message: '¡¡¡UN MILLÓN DE CROQUETAS!!! ¡Eres oficialmente un croqueta-millonario!',
    priority: 70,
    category: 'milestone',
  },
  {
    id: 'million_advice',
    minPoints: 2500000,
    maxPoints: 5000000,
    message:
      'Con estos números, los productores avanzados empiezan a valer la pena. ¡Invierte fuerte!',
    priority: 75,
    category: 'tips',
  },
  {
    id: 'five_million',
    minPoints: 5000000,
    maxPoints: 10000000,
    message: '5 millones... ¿Has considerado abrir una franquicia de croquetas?',
    priority: 80,
    category: 'humor',
  },
  {
    id: 'ten_million',
    minPoints: 10000000,
    maxPoints: 25000000,
    message: '¡10M! A este ritmo, pronto estarás nadando en croquetas (no literalmente... o sí?).',
    priority: 85,
    category: 'encouragement',
  },
  {
    id: 'twenty_five_million',
    minPoints: 25000000,
    maxPoints: 50000000,
    message: '25 millones de croquetas. Esto ya no es un juego, es un estilo de vida.',
    priority: 90,
    category: 'humor',
  },
  {
    id: 'fifty_million',
    minPoints: 50000000,
    maxPoints: 100000000,
    message: '50M croquetas. ¿Has probado todas las skins? ¡Hay colecciones enteras por descubrir!',
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
    message: '¡100 MILLONES! Ya no eres humano, eres una leyenda viviente del clickeo.',
    priority: 100,
    category: 'milestone',
  },
  {
    id: 'quarter_billion',
    minPoints: 250000000,
    maxPoints: 500000000,
    message: 'Un cuarto de billón... Los números ya ni tienen sentido. ¡Pero sigue adelante!',
    priority: 105,
    category: 'encouragement',
  },
  {
    id: 'half_billion',
    minPoints: 500000000,
    maxPoints: 1000000000,
    message: '500M. Tip: Las mejoras de nivel alto multiplican tu producción exponencialmente.',
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
    message: '¡¡¡MIL MILLONES!!! Ya no hay vuelta atrás. Eres el rey de las croquetas.',
    priority: 115,
    category: 'milestone',
  },
  {
    id: 'five_billion',
    minPoints: 5000000000,
    maxPoints: 10000000000,
    message: '5 billones de croquetas. Podrías alimentar a un país entero. O tres.',
    priority: 120,
    category: 'humor',
  },
  {
    id: 'ten_billion',
    minPoints: 10000000000,
    maxPoints: 50000000000,
    message: '10B... ¿Sigues recordando cómo fue tu primer click? Qué tiempos aquellos...',
    priority: 125,
    category: 'encouragement',
  },
  {
    id: 'fifty_billion',
    minPoints: 50000000000,
    maxPoints: 100000000000,
    message: '50 billones. Advertencia: Estos números pueden causar mareos.',
    priority: 130,
    category: 'humor',
  },
  {
    id: 'hundred_billion',
    minPoints: 100000000000,
    maxPoints: 500000000000,
    message: '¡100B! Tu producción por segundo es probablemente superior al PIB de algunos países.',
    priority: 135,
    category: 'milestone',
  },
  {
    id: 'half_trillion',
    minPoints: 500000000000,
    maxPoints: 1000000000000,
    message: 'Medio trillón... ¿Aún te quedan logros por desbloquear? ¡Revísalos!',
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
    message: '¡¡¡UN TRILLÓN!!! Ya no estamos en Kansas, Dorothy. Ni en la Tierra.',
    priority: 145,
    category: 'milestone',
  },
  {
    id: 'ten_trillion',
    minPoints: 10000000000000,
    maxPoints: 100000000000000,
    message: '10 trillones. En este punto, ya es arte abstracto numérico.',
    priority: 150,
    category: 'humor',
  },
  {
    id: 'hundred_trillion',
    minPoints: 100000000000000,
    maxPoints: 1000000000000000,
    message: '100T. Consejo: Los productores premium son tu mejor inversión ahora.',
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
    message:
      '¡CUADRILLÓN! Los matemáticos están orgullosos. Tus padres... no tanto. Pero ¡felicidades!',
    priority: 160,
    category: 'milestone',
  },
  {
    id: 'quintillion_zone',
    minPoints: 1000000000000000000,
    maxPoints: 1000000000000000000000,
    message: 'Quintillón alcanzado. Ya perdiste contacto con la realidad hace tiempo. ¡Sigue así!',
    priority: 165,
    category: 'humor',
  },
  {
    id: 'sextillion_warning',
    minPoints: 1000000000000000000000,
    maxPoints: 1000000000000000000000000,
    message: 'Sextillón... Me preocupa tu salud mental, pero respeto tu dedicación.',
    priority: 170,
    category: 'warning',
  },
  {
    id: 'septillion_madness',
    minPoints: 1000000000000000000000000,
    maxPoints: 1000000000000000000000000000,
    message: 'Septillón. Oficialmente has trascendido. Eres uno con las croquetas.',
    priority: 175,
    category: 'milestone',
  },
  {
    id: 'octillion_gods',
    minPoints: 1000000000000000000000000000,
    maxPoints: 1000000000000000000000000000000,
    message: 'Octillón... Los dioses de las croquetas te observan con respeto y un poco de miedo.',
    priority: 180,
    category: 'humor',
  },
  {
    id: 'nonillion_legend',
    minPoints: 1000000000000000000000000000000,
    maxPoints: 1000000000000000000000000000000000,
    message: 'Un... ¿Nonillón? He tenido que buscar ese número en Google. Sal a la calle un rato.',
    priority: 185,
    category: 'humor',
  },
  {
    id: 'decillion_limit',
    minPoints: 1000000000000000000000000000000000,
    maxPoints: 1000000000000000000000000000000000000,
    message: 'Un decillón... Creo que ya es suficiente. Ve a dar un paseo, por favor.',
    priority: 190,
    category: 'humor',
  },
  {
    id: 'more_and_beyond',
    minPoints: 1000000000000000000000000000000000000,
    message: '¿Más de un decillón? En serio, ve a ver la luz del sol. Las croquetas pueden esperar.',
    priority: 195,
    category: 'humor',
  },

  // ============================================================
  // CONSEJOS BASADOS EN CLICKS
  // ============================================================
  {
    id: 'clicks_10',
    minClicks: 10,
    maxClicks: 50,
    message: '¡10 clicks! Cada uno cuenta. Sigue así y pronto serás un maestro del mouse.',
    priority: 200,
    category: 'encouragement',
  },
  {
    id: 'clicks_100',
    minClicks: 100,
    maxClicks: 500,
    message: '100 clicks! Tus dedos están empezando a tomar forma.',
    priority: 205,
    category: 'encouragement',
  },
  {
    id: 'clicks_1000',
    minClicks: 1000,
    maxClicks: 5000,
    message: '¡1.000 clicks! Tu dedo merece una medalla.',
    priority: 210,
    category: 'achievement',
  },
  {
    id: 'clicks_10000',
    minClicks: 10000,
    maxClicks: 50000,
    message: '10K clicks... Espero que estés usando una buena ergonomía de mano.',
    priority: 215,
    category: 'humor',
  },
  {
    id: 'clicks_100000',
    minClicks: 100000,
    message: '¡¡¡100K clicks!!! Tu mouse ya nunca será el mismo. F por tu mouse.',
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
    message: '¡Nivel 5! Ya no eres un novato. Las mejoras de nivel alto están cerca.',
    priority: 300,
    category: 'milestone',
  },
  {
    id: 'level_10',
    minLevel: 10,
    maxLevel: 20,
    message: 'Nivel 10 alcanzado. ¡Las mejoras de nivel medio ya están disponibles!',
    priority: 305,
    category: 'milestone',
  },
  {
    id: 'level_20',
    minLevel: 20,
    maxLevel: 30,
    message: '¡Nivel 20! Ya eres todo un veterano. Las mejoras late-game te esperan.',
    priority: 310,
    category: 'milestone',
  },
  {
    id: 'level_30',
    minLevel: 30,
    maxLevel: 50,
    message: 'Nivel 30... Las mejoras más poderosas están ahora a tu alcance. ¡Úsalas bien!',
    priority: 315,
    category: 'tips',
  },
  {
    id: 'level_50',
    minLevel: 50,
    message: '¡¡NIVEL 50!! Eres leyenda. Solo los más dedicados llegan aquí.',
    priority: 320,
    category: 'achievement',
  },

  // ============================================================
  // TIPS GENERALES Y ESTRATEGIA
  // ============================================================
  {
    id: 'tip_efficiency',
    message:
      'Tip: Calcula el coste por croqueta/segundo de cada productor para optimizar tu estrategia.',
    priority: 400,
    category: 'tips',
  },
  {
    id: 'tip_combo',
    message: 'Las mejoras y productores trabajan en sinergia. ¡Combínalos sabiamente!',
    priority: 401,
    category: 'tips',
  },
  {
    id: 'tip_achievements',
    message: 'Muchos logros están ocultos. ¡Experimenta para encontrarlos todos!',
    priority: 402,
    category: 'tips',
  },
  {
    id: 'tip_patience',
    message:
      'La paciencia es clave. A veces es mejor esperar y ahorrar para la siguiente gran mejora.',
    priority: 403,
    category: 'tips',
  },
  {
    id: 'tip_active_vs_idle',
    message:
      '¿Sabías? Puedes jugar activamente (clickeando) o pasivamente (con productores). ¡Encuentra tu estilo!',
    priority: 404,
    category: 'tips',
  },

  // ============================================================
  // MENSAJES DE HUMOR Y MOTIVACIÓN
  // ============================================================
  {
    id: 'humor_addiction',
    message: 'Recuerda: Las croquetas no son reales, pero tu adicción sí lo es.',
    priority: 500,
    category: 'humor',
  },
  {
    id: 'humor_grass',
    message: 'Por favor, sal a tocar hierba de vez en cuando.',
    priority: 501,
    category: 'humor',
  },
  {
    id: 'humor_sleep',
    message: '¿Has dormido hoy? Las croquetas estarán aquí cuando vuelvas. Probablemente.',
    priority: 502,
    category: 'humor',
  },
  {
    id: 'humor_family',
    message: 'Tu familia te extraña. Pero entendemos que las croquetas son prioridad.',
    priority: 503,
    category: 'humor',
  },
  {
    id: 'motivacion_1',
    message: '¡Tú puedes! Cada croqueta te acerca más a la grandeza.',
    priority: 510,
    category: 'encouragement',
  },
  {
    id: 'motivacion_2',
    message: 'No te rindas ahora. Los números grandes están a la vuelta de la esquina.',
    priority: 511,
    category: 'encouragement',
  },
  {
    id: 'motivacion_3',
    message: 'Eres increíble. Mira hasta dónde has llegado desde ese primer click.',
    priority: 512,
    category: 'encouragement',
  },

  // ============================================================
  // AYUDA GENERAL Y NAVEGACIÓN
  // ============================================================
  {
    id: 'help_navigation',
    message: 'Usa los menús para sacar el máximo provecho de tu experiencia croquetera.',
    priority: 600,
    category: 'tutorial',
  },
  {
    id: 'help_stats',
    message: '¿Sabías que puedes ver todas tus estadísticas detalladas en el menú de Stats?',
    priority: 601,
    category: 'tutorial',
  },
  {
    id: 'help_skins',
    message: 'Las skins no dan bonificaciones, pero hacen que tu croqueta se vea genial.',
    priority: 602,
    category: 'tutorial',
  },
  {
    id: 'general_help',
    message:
      '¿Necesitas ayuda? Explora los diferentes menús o simplemente sigue clickeando. ¡Tú decides!',
    priority: 1000,
    category: 'tutorial',
  },
];
