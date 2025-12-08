import { UpgradeModel } from '@models/upgrade.model';
import Decimal from 'break_infinity.js';

function calculatePrice(baseLevel: Decimal, basePrice: Decimal, targetLevel: number): Decimal {
  const newTargetLevel = new Decimal(targetLevel);
  // Factor exponencial basado en la diferencia de niveles
  const levelDiff = newTargetLevel.minus(baseLevel);

  // Base multiplicadora que escala con el nivel
  const baseMultiplier = new Decimal(1.65);

  // Calculamos el precio
  const price = basePrice.times(baseMultiplier.pow(levelDiff));

  // Redondeamos a números "bonitos" (múltiplos de 10, 100, 1000 según el tamaño)
  return roundToNiceNumber(price);
}

function roundToNiceNumber(num: Decimal): Decimal {
  if (num.lessThanOrEqualTo(0)) return num;
  let denario = new Decimal(1);
  // Encontrar la potencia de 10 apropiada
  while (num.dividedBy(denario).greaterThanOrEqualTo(10)) {
    //Multiplica por 10
    denario = denario.times(10);
  }
  // Redondear al múltiplo más cercano de denario
  return num.dividedBy(denario).round().times(denario);
}

const precioBase = new Decimal(80);
const levelBase = new Decimal(2);

export const UPGRADES: UpgradeModel[] = [
  // ============================================================
  // 🥇 EARLY GAME - (Niveles 1-35) - CLICKS DOMINAN
  // ============================================================
  {
    id: 1,
    name: 'upgrades.upgrade_1',
    image: '/assets/upgrades/general.webp',
    price: precioBase,
    clicks: 4,
    level: 2,
    exp: 25,
  },
  {
    id: 2,
    name: 'upgrades.upgrade_2',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 4),
    clicks: 12,
    level: 4,
    exp: 55,
  },
  {
    id: 3,
    name: 'upgrades.upgrade_3',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 7),
    clicks: 35,
    level: 7,
    exp: 120,
  },
  {
    id: 4,
    name: 'upgrades.upgrade_4',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 10),
    clicks: 90,
    level: 10,
    exp: 280,
  },
  {
    id: 5,
    name: 'upgrades.upgrade_5',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 13),
    clicks: 220,
    level: 13,
    exp: 650,
  },
  {
    id: 6,
    name: 'upgrades.upgrade_6',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 17),
    clicks: 550,
    level: 17,
    exp: 1_500,
  },
  {
    id: 7,
    name: 'upgrades.upgrade_7',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 21),
    clicks: 1_400,
    level: 21,
    exp: 3_500,
  },
  {
    id: 8,
    name: 'upgrades.upgrade_8',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 25),
    clicks: 3_500,
    level: 25,
    exp: 8_000,
  },
  {
    id: 9,
    name: 'upgrades.upgrade_9',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 30),
    clicks: 9_000,
    level: 30,
    exp: 18_000,
  },
  {
    id: 10,
    name: 'upgrades.upgrade_10',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 35),
    clicks: 22_000,
    level: 35,
    exp: 40_000,
  },

  // ============================================================
  // ⚙️ MID GAME - (Niveles 40-85) - CLICKS SIGUEN SIENDO REY
  // ============================================================
  {
    id: 11,
    name: 'upgrades.upgrade_11',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 40),
    clicks: 55_000,
    level: 40,
    exp: 90_000,
  },
  {
    id: 12,
    name: 'upgrades.upgrade_12',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 45),
    clicks: 140_000,
    level: 45,
    exp: 200_000,
  },
  {
    id: 13,
    name: 'upgrades.upgrade_13',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 50),
    clicks: 350_000,
    level: 50,
    exp: 450_000,
  },
  {
    id: 14,
    name: 'upgrades.upgrade_14',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 55),
    clicks: 900_000,
    level: 55,
    exp: 1_000_000,
  },
  {
    id: 15,
    name: 'upgrades.upgrade_15',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 60),
    clicks: 2_200_000,
    level: 60,
    exp: 2_200_000,
  },
  {
    id: 16,
    name: 'upgrades.upgrade_16',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 65),
    clicks: 5_500_000,
    level: 65,
    exp: 5_000_000,
  },
  {
    id: 17,
    name: 'upgrades.upgrade_17',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 70),
    clicks: 14_000_000,
    level: 70,
    exp: 11_000_000,
  },
  {
    id: 18,
    name: 'upgrades.upgrade_18',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 75),
    clicks: 35_000_000,
    level: 75,
    exp: 25_000_000,
  },
  {
    id: 19,
    name: 'upgrades.upgrade_19',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 80),
    clicks: 85_000_000,
    level: 80,
    exp: 55_000_000,
  },
  {
    id: 20,
    name: 'upgrades.upgrade_20',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 85),
    clicks: 210_000_000,
    level: 85,
    exp: 120_000_000,
  },

  // ============================================================
  // 🔥 LATE GAME - (Niveles 90-140) - CLICKS = PODER ABSOLUTO
  // ============================================================
  {
    id: 21,
    name: 'upgrades.upgrade_21',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 90),
    clicks: 520_000_000,
    level: 90,
    exp: 270_000_000,
  },
  {
    id: 22,
    name: 'upgrades.upgrade_22',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 95),
    clicks: 1_300_000_000,
    level: 95,
    exp: 600_000_000,
  },
  {
    id: 23,
    name: 'upgrades.upgrade_23',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 100),
    clicks: 3_200_000_000,
    level: 100,
    exp: 1_300_000_000,
  },
  {
    id: 24,
    name: 'upgrades.upgrade_24',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 105),
    clicks: 8_000_000_000,
    level: 105,
    exp: 3_000_000_000,
  },
  {
    id: 25,
    name: 'upgrades.upgrade_25',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 110),
    clicks: 20_000_000_000,
    level: 110,
    exp: 6_500_000_000,
  },
  {
    id: 26,
    name: 'upgrades.upgrade_26',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 115),
    clicks: 50_000_000_000,
    level: 115,
    exp: 15_000_000_000,
  },
  {
    id: 27,
    name: 'upgrades.upgrade_27',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 120),
    clicks: 120_000_000_000,
    level: 120,
    exp: 35_000_000_000,
  },
  {
    id: 28,
    name: 'upgrades.upgrade_28',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 125),
    clicks: 300_000_000_000,
    level: 125,
    exp: 80_000_000_000,
  },
  {
    id: 29,
    name: 'upgrades.upgrade_29',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 130),
    clicks: 750_000_000_000,
    level: 130,
    exp: 180_000_000_000,
  },
  {
    id: 30,
    name: 'upgrades.upgrade_30',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 140),
    clicks: 1_800_000_000_000,
    level: 140,
    exp: 400_000_000_000,
  },

  // ============================================================
  // 🌀 ENDGAME - (Niveles 150+) - CADA CLICK ES DEVASTADOR
  // ============================================================
  {
    id: 31,
    name: 'upgrades.upgrade_31',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 150),
    clicks: 4_500_000_000_000,
    level: 150,
    exp: 900_000_000_000,
  },
  {
    id: 32,
    name: 'upgrades.upgrade_32',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 200),
    clicks: 50_000_000_000_000,
    level: 200,
    exp: 5_000_000_000_000,
  },
  {
    id: 33,
    name: 'upgrades.upgrade_33',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 300),
    clicks: 500_000_000_000_000,
    level: 300,
    exp: 50_000_000_000_000,
  },
];
