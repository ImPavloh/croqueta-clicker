import { UpgradeModel } from '@models/upgrade.model';
import Decimal from 'break_infinity.js';

function calculatePrice(baseLevel: Decimal, basePrice: Decimal, targetLevel: number): Decimal {
  const newTargetLevel = new Decimal(targetLevel);
  // Factor exponencial basado en la diferencia de niveles
  const levelDiff = newTargetLevel.minus(baseLevel);

  // Base multiplicadora que escala con el nivel
  const baseMultiplier = new Decimal(1.8).plus(newTargetLevel.times(0.08));

  // Calculamos el precio
  const price = basePrice.times(baseMultiplier.pow(levelDiff));

  // Redondeamos a números "bonitos" (múltiplos de 10, 100, 1000 según el tamaño)
  return roundToNiceNumber(price);
}

function roundToNiceNumber(num: Decimal): Decimal {
  if (num.lessThanOrEqualTo(0)) return num;

  let deca = new Decimal(1);

  // Encontrar la potencia de 10 apropiada
  while (num.dividedBy(deca).greaterThanOrEqualTo(10)) {
      deca = deca.times(10);
  }

  // Redondear al múltiplo más cercano de deca
  return num.dividedBy(deca).round().times(deca);
}

const precioBase = new Decimal(100);
const levelBase = new Decimal(2);

export const UPGRADES: UpgradeModel[] = [
  // ============================================================
  // 🥇 EARLY GAME - (Niveles 1-35) - CON FÓRMULA APLICADA
  // ============================================================
  {
    id: 1,
    name: 'upgrades.upgrade_1',
    image: '/assets/upgrades/general.webp',
    price: precioBase, // Convertir a número para el modelo
    clicks: 2,
    level: 2,
    exp: 5,
  },
  {
    id: 2,
    name: 'upgrades.upgrade_2',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 4),
    clicks: 4,
    level: 4,
    exp: 8,
  },
  {
    id: 3,
    name: 'upgrades.upgrade_3',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 7),
    clicks: 6,
    level: 7,
    exp: 12,
  },
  {
    id: 4,
    name: 'upgrades.upgrade_4',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 10),
    clicks: 10,
    level: 10,
    exp: 25,
  },
  {
    id: 5,
    name: 'upgrades.upgrade_5',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 13),
    clicks: 20,
    level: 13,
    exp: 45,
  },
  {
    id: 6,
    name: 'upgrades.upgrade_6',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 17),
    clicks: 40,
    level: 17,
    exp: 90,
  },
  {
    id: 7,
    name: 'upgrades.upgrade_7',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 21),
    clicks: 80,
    level: 21,
    exp: 180,
  },
  {
    id: 8,
    name: 'upgrades.upgrade_8',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 25),
    clicks: 160,
    level: 25,
    exp: 360,
  },
  {
    id: 9,
    name: 'upgrades.upgrade_9',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 30),
    clicks: 300,
    level: 30,
    exp: 700,
  },
  {
    id: 10,
    name: 'upgrades.upgrade_10',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 35),
    clicks: 600,
    level: 35,
    exp: 1_400,
  },

  // ============================================================
  // ⚙️ MID GAME - (Niveles 40-85) - CON FÓRMULA APLICADA
  // ============================================================
  {
    id: 11,
    name: 'upgrades.upgrade_11',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 40),
    clicks: 1_200,
    level: 40,
    exp: 3_000,
  },
  {
    id: 12,
    name: 'upgrades.upgrade_12',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 45),
    clicks: 2_500,
    level: 45,
    exp: 6_000,
  },
  {
    id: 13,
    name: 'upgrades.upgrade_13',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 50),
    clicks: 5_000,
    level: 50,
    exp: 12_000,
  },
  {
    id: 14,
    name: 'upgrades.upgrade_14',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 55),
    clicks: 10_000,
    level: 55,
    exp: 25_000,
  },
  {
    id: 15,
    name: 'upgrades.upgrade_15',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 60),
    clicks: 20_000,
    level: 60,
    exp: 50_000,
  },
  {
    id: 16,
    name: 'upgrades.upgrade_16',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 65),
    clicks: 40_000,
    level: 65,
    exp: 100_000,
  },
  {
    id: 17,
    name: 'upgrades.upgrade_17',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 70),
    clicks: 80_000,
    level: 70,
    exp: 200_000,
  },
  {
    id: 18,
    name: 'upgrades.upgrade_18',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 75),
    clicks: 170_000,
    level: 75,
    exp: 400_000,
  },
  {
    id: 19,
    name: 'upgrades.upgrade_19',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 80),
    clicks: 350_000,
    level: 80,
    exp: 800_000,
  },
  {
    id: 20,
    name: 'upgrades.upgrade_20',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 85),
    clicks: 700_000,
    level: 85,
    exp: 1_700_000,
  },

  // ============================================================
  // 🔥 LATE GAME - (Niveles 90-140) - CON FÓRMULA APLICADA
  // ============================================================
  {
    id: 21,
    name: 'upgrades.upgrade_21',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 90),
    clicks: 1_400_000,
    level: 90,
    exp: 4_000_000,
  },
  {
    id: 22,
    name: 'upgrades.upgrade_22',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 95),
    clicks: 3_000_000,
    level: 95,
    exp: 8_500_000,
  },
  {
    id: 23,
    name: 'upgrades.upgrade_23',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 100),
    clicks: 6_000_000,
    level: 100,
    exp: 17_000_000,
  },
  {
    id: 24,
    name: 'upgrades.upgrade_24',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 105),
    clicks: 13_000_000,
    level: 105,
    exp: 35_000_000,
  },
  {
    id: 25,
    name: 'upgrades.upgrade_25',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 110),
    clicks: 24_000_000,
    level: 110,
    exp: 65_000_000,
  },
  {
    id: 26,
    name: 'upgrades.upgrade_26',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 115),
    clicks: 50_000_000,
    level: 115,
    exp: 135_000_000,
  },
  {
    id: 27,
    name: 'upgrades.upgrade_27',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 120),
    clicks: 100_000_000,
    level: 120,
    exp: 270_000_000,
  },
  {
    id: 28,
    name: 'upgrades.upgrade_28',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 125),
    clicks: 200_000_000,
    level: 125,
    exp: 540_000_000,
  },
  {
    id: 29,
    name: 'upgrades.upgrade_29',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 130),
    clicks: 440_000_000,
    level: 130,
    exp: 1_200_000_000,
  },
  {
    id: 30,
    name: 'upgrades.upgrade_30',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 140),
    clicks: 1_000_000_000,
    level: 140,
    exp: 2_700_000_000,
  },

  // ============================================================
  // 🌀 ENDGAME - (Niveles 150+) - CON FÓRMULA APLICADA
  // ============================================================
  {
    id: 31,
    name: 'upgrades.upgrade_31',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 150),
    clicks: 2_000_000_000,
    level: 150,
    exp: 10_000_000_000,
  },
  {
    id: 32,
    name: 'upgrades.upgrade_32',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 200),
    clicks: 20_000_000_000,
    level: 200,
    exp: 100_000_000_000,
  },
  {
    id: 33,
    name: 'upgrades.upgrade_33',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 300),
    clicks: 200_000_000_000,
    level: 300,
    exp: 1_000_000_000_000,
  },
];
