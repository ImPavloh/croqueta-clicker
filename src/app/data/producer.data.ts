import { ProducerModel } from 'app/models/producer.model';

export const PRODUCERS: ProducerModel[] = [
  // ============================================================
  // 🥚 EARLY GAME - Primeras fuentes automáticas de croquetas
  // ============================================================
  {
    id: 1,
    name: 'producers.producer_1_name',
    image: '/assets/producers/click.webp',
    priceBase: 50,
    priceMult: 1.12,
    pointsBase: 0.2,
    pointsSum: 0.3, // Aumentado para que el primer productor sea un poco más satisfactorio
    description: 'producers.producer_1_description',
    level: 0,
    exp: 1,
  },
  {
    id: 2,
    name: 'producers.producer_2_name',
    image: '/assets/producers/cocinero.webp',
    priceBase: 500,
    priceMult: 1.15,
    pointsBase: 1.5, // Aumentado para un mejor arranque
    pointsSum: 0.8,
    description: 'producers.producer_2_description',
    level: 5,
    exp: 12,
  },
  {
    id: 3,
    name: 'producers.producer_3_name',
    image: '/assets/producers/freidora.webp',
    priceBase: 10_000,
    priceMult: 1.17, // Ligeramente reducido
    pointsBase: 8,   // Aumentado significativamente para que sea más impactante
    pointsSum: 2,
    description: 'producers.producer_3_description',
    level: 10,
    exp: 65,
  },
  {
    id: 4,
    name: 'producers.producer_4_name',
    image: '/assets/producers/fabrica.webp',
    priceBase: 150_000,
    priceMult: 1.18, // Reducido para suavizar el "muro"
    pointsBase: 45,  // Aumentado para que el salto de precio se sienta justificado
    pointsSum: 10,
    description: 'producers.producer_4_description',
    level: 20,
    exp: 350,
  },

  // ============================================================
  // ⚙️ MID GAME - Productores de investigación y automatización
  // ============================================================
  {
    id: 5,
    name: 'producers.producer_5_name',
    image: '/assets/producers/universidad.webp',
    priceBase: 750_000,
    priceMult: 1.20, // Reducido
    pointsBase: 250, // Aumentado
    pointsSum: 50,
    description: 'producers.producer_5_description',
    level: 30,
    exp: 1_800,
  },
  {
    id: 6,
    name: 'producers.producer_6_name',
    image: '/assets/producers/croquetabot.webp',
    priceBase: 250_000,
    priceMult: 1.24,
    pointsBase: 1_600, // Reducido para encajar mejor en la nueva curva
    pointsSum: 300,
    description: 'producers.producer_6_description',
    level: 50,
    exp: 9_000,
  },
  {
    id: 7,
    name: 'producers.producer_7_name',
    image: '/assets/producers/importadora.webp',
    priceBase: 1_200_000,
    priceMult: 1.26,
    pointsBase: 45_000,
    pointsSum: 3_000,
    description: 'producers.producer_7_description',
    level: 65,
    exp: 55_000,
  },

  // ============================================================
  // 🔥 LATE GAME - Productores místicos y de escala universal
  // ============================================================
  {
    id: 8,
    name: 'producers.producer_8_name',
    image: '/assets/producers/iglesia.webp',
    priceBase: 2_500_000,
    priceMult: 1.28,
    pointsBase: 200_000,
    pointsSum: 20_000,
    description: 'producers.producer_8_description',
    level: 80,
    exp: 130_000,
  },
  {
    id: 9,
    name: 'producers.producer_9_name',
    image: '/assets/producers/portal.webp',
    priceBase: 35_000_000,
    priceMult: 1.3,
    pointsBase: 1_500_000,
    pointsSum: 120_000,
    description: 'producers.producer_9_description',
    level: 100,
    exp: 400_000,
  },
  {
    id: 10,
    name: 'producers.producer_10_name',
    image: '/assets/producers/singularidad.webp',
    priceBase: 1_000_000_000,
    priceMult: 1.33,
    pointsBase: 18_000_000,
    pointsSum: 1_500_000,
    description: 'producers.producer_10_description',
    level: 120,
    exp: 3_500_000,
  },

  // ============================================================
  // 🌀 ENDGAME - Escala cósmica y mecánicas late+ascension
  // ============================================================
  {
    id: 11,
    name: 'producers.producer_11_name',
    image: '/assets/producers/crispy_cosmos.webp',
    priceBase: 120_000_000_000,
    priceMult: 1.38,
    pointsBase: 250_000_000,
    pointsSum: 25_000_000,
    description: 'producers.producer_11_description',
    level: 150,
    exp: 30_000_000,
  },
  {
    id: 12,
    name: 'producers.producer_12_name',
    image: '/assets/producers/motor_cuantico.webp',
    priceBase: 7_500_000_000_000,
    priceMult: 1.45,
    pointsBase: 4_000_000_000,
    pointsSum: 400_000_000,
    description: 'producers.producer_12_description',
    level: 180,
    exp: 300_000_000,
  },
  {
    id: 13,
    name: 'producers.producer_13_name',
    image: '/assets/producers/croqueta_fractal.webp',
    priceBase: 9_000_000_000_000_000,
    priceMult: 1.5,
    pointsBase: 1_000_000_000_000,
    pointsSum: 120_000_000_000,
    description: 'producers.producer_13_description',
    level: 210,
    exp: 2_500_000_000,
  },
  {
    id: 14,
    name: 'producers.producer_14_name',
    image: '/assets/producers/croqueta_exe.webp',
    priceBase: 20_000_000_000_000_000_000,
    priceMult: 1.75,
    pointsBase: 1_000_000_000_000_000,
    pointsSum: 100_000_000_000_000,
    description: 'producers.producer_14_description',
    level: 240,
    exp: 1_000_000_000_000,
  },
  {
    id: 15,
    name: 'producers.producer_15_name',
    image: '/assets/producers/tu.webp',
    priceBase: 1_000_000_000_000_000_000_000_000_000,
    priceMult: 2,
    pointsBase: 1_000_000_000_000_000_000_000_000,
    pointsSum: 100_000_000_000_000_000_000_000,
    description: 'producers.producer_15_description',
    level: 500,
    exp: 100_000_000_000_000_000,
  },
];
