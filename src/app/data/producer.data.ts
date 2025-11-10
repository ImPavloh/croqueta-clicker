import { ProducerModel } from "app/models/producer.model";


export const PRODUCERS: ProducerModel[] = [

  // ============================================================
  // 🥚 EARLY GAME - Primeras fuentes automáticas de croquetas
  // ============================================================
  {
    id: 1,
    name: 'Click',
    image: '/assets/producers/click.webp',
    priceBase: 25,
    priceMult: 1.15,
    pointsBase: 1,
    pointsSum: 1,
    description: 'Hace clicks automáticos por ti.',
    level: 3,
    exp: 1
  },
  {
    id: 2,
    name: 'Cocinero',
    image: '/assets/producers/cocinero.webp',
    priceBase: 150,
    priceMult: 1.18,
    pointsBase: 5,
    pointsSum: 3,
    description: 'Un cocinero profesional que hace croquetas por ti.',
    level: 7,
    exp: 8
  },
  {
    id: 3,
    name: 'Freidora',
    image: '/assets/producers/freidora.webp',
    priceBase: 1_200,
    priceMult: 1.2,
    pointsBase: 30,
    pointsSum: 8,
    description: 'Una freidora industrial que produce croquetas a gran escala.',
    level: 10,
    exp: 50
  },
  {
    id: 4,
    name: 'Fábrica',
    image: '/assets/producers/fabrica.webp',
    priceBase: 8_000,
    priceMult: 1.22,
    pointsBase: 150,
    pointsSum: 25,
    description: 'Una fábrica automatizada de croquetas. Aprobada por Chicote.',
    level: 15,
    exp: 250
  },

  // ============================================================
  // ⚙️ MID GAME - Productores de investigación y automatización
  // ============================================================
  {
    id: 5,
    name: 'Universidad Gastronómica',
    image: '/assets/producers/universidad.webp',
    priceBase: 40_000,
    priceMult: 1.23,
    pointsBase: 900,
    pointsSum: 80,
    description: 'Investigación y desarrollo de croquetas.',
    level: 20,
    exp: 1300
  },
  {
    id: 6,
    name: 'CroquetaBot',
    image: '/assets/producers/croquetabot.webp',
    priceBase: 200_000,
    priceMult: 1.25,
    pointsBase: 5_000,
    pointsSum: 400,
    description: 'Robot avanzado que produce croquetas a gran ritmo.',
    level: 25,
    exp: 7500
  },

  // ============================================================
  // 🔥 LATE GAME - Productores místicos y de escala universal
  // ============================================================
  {
    id: 7,
    name: 'Iglesia de la Croqueta',
    image: '/assets/producers/iglesia.webp',
    priceBase: 1_500_000,
    priceMult: 1.27,
    pointsBase: 30_000,
    pointsSum: 2_500,
    description: 'Veneración y promoción de la croqueta.',
    level: 35,
    exp: 45_000
  },
  {
    id: 8,
    name: 'Portal Croqueta',
    image: '/assets/producers/portal.webp',
    priceBase: 20_000_000,
    priceMult: 1.3,
    pointsBase: 200_000,
    pointsSum: 20_000,
    description: 'Un portal interdimensional que trae croquetas de otros universos.',
    level: 45,
    exp: 300_000
  },
  {
    id: 9,
    name: 'Singularidad Fritanga',
    image: '/assets/producers/singularidad.webp',
    priceBase: 500_000_000,
    priceMult: 1.35,
    pointsBase: 2_000_000,
    pointsSum: 250_000,
    description: 'IA que domina el universo y produce croquetas infinitas.',
    level: 60,
    exp: 3_000_000
  },
];
