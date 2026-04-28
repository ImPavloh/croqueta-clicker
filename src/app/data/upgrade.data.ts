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

function roundToNiceInteger(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return value;

  const exponent = Math.floor(Math.log10(value));
  const scale = Math.pow(10, Math.max(0, exponent - 2));
  return Math.round(value / scale) * scale;
}

function getUpgradePriceMultiplier(level: number): number {
  if (level <= 20) return 20;
  if (level <= 35) return 40;
  if (level <= 50) return 100;
  if (level <= 80) return 400;
  if (level <= 120) return 2_000;
  if (level <= 200) return 10_000;
  if (level <= 400) return 60_000;
  if (level <= 800) return 400_000;
  return 2_000_000;
}

function calculateBalancedUpgradePrice(clicks: number, level: number): Decimal {
  return roundToNiceNumber(new Decimal(clicks).times(getUpgradePriceMultiplier(level)));
}

function calculateLateValue(baseValue: number, growth: number, step: number): number {
  return roundToNiceInteger(baseValue * Math.pow(growth, step));
}

const precioBase = new Decimal(80);
const levelBase = new Decimal(2);

const CORE_UPGRADES: UpgradeModel[] = [
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
    level: 6,
    exp: 120,
  },
  {
    id: 4,
    name: 'upgrades.upgrade_4',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 10),
    clicks: 90,
    level: 8,
    exp: 280,
  },
  {
    id: 5,
    name: 'upgrades.upgrade_5',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 13),
    clicks: 220,
    level: 10,
    exp: 650,
  },
  {
    id: 6,
    name: 'upgrades.upgrade_6',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 17),
    clicks: 550,
    level: 12,
    exp: 1_500,
  },
  {
    id: 7,
    name: 'upgrades.upgrade_7',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 21),
    clicks: 1_400,
    level: 14,
    exp: 3_500,
  },
  {
    id: 8,
    name: 'upgrades.upgrade_8',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 25),
    clicks: 3_500,
    level: 16,
    exp: 8_000,
  },
  {
    id: 9,
    name: 'upgrades.upgrade_9',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 30),
    clicks: 9_000,
    level: 18,
    exp: 18_000,
  },
  {
    id: 10,
    name: 'upgrades.upgrade_10',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 35),
    clicks: 22_000,
    level: 20,
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
    level: 25,
    exp: 90_000,
  },
  {
    id: 12,
    name: 'upgrades.upgrade_12',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 45),
    clicks: 140_000,
    level: 30,
    exp: 200_000,
  },
  {
    id: 13,
    name: 'upgrades.upgrade_13',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 50),
    clicks: 350_000,
    level: 35,
    exp: 450_000,
  },
  {
    id: 14,
    name: 'upgrades.upgrade_14',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 55),
    clicks: 900_000,
    level: 40,
    exp: 1_000_000,
  },
  {
    id: 15,
    name: 'upgrades.upgrade_15',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 60),
    clicks: 2_200_000,
    level: 45,
    exp: 2_200_000,
  },
  {
    id: 16,
    name: 'upgrades.upgrade_16',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 65),
    clicks: 5_500_000,
    level: 50,
    exp: 5_000_000,
  },
  {
    id: 17,
    name: 'upgrades.upgrade_17',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 70),
    clicks: 14_000_000,
    level: 55,
    exp: 11_000_000,
  },
  {
    id: 18,
    name: 'upgrades.upgrade_18',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 75),
    clicks: 35_000_000,
    level: 60,
    exp: 25_000_000,
  },
  {
    id: 19,
    name: 'upgrades.upgrade_19',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 80),
    clicks: 85_000_000,
    level: 65,
    exp: 55_000_000,
  },
  {
    id: 20,
    name: 'upgrades.upgrade_20',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 85),
    clicks: 210_000_000,
    level: 70,
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
    level: 75,
    exp: 270_000_000,
  },
  {
    id: 22,
    name: 'upgrades.upgrade_22',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 95),
    clicks: 1_300_000_000,
    level: 80,
    exp: 600_000_000,
  },
  {
    id: 23,
    name: 'upgrades.upgrade_23',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 100),
    clicks: 3_200_000_000,
    level: 85,
    exp: 1_300_000_000,
  },
  {
    id: 24,
    name: 'upgrades.upgrade_24',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 105),
    clicks: 8_000_000_000,
    level: 90,
    exp: 3_000_000_000,
  },
  {
    id: 25,
    name: 'upgrades.upgrade_25',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 110),
    clicks: 20_000_000_000,
    level: 95,
    exp: 6_500_000_000,
  },
  {
    id: 26,
    name: 'upgrades.upgrade_26',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 115),
    clicks: 50_000_000_000,
    level: 100,
    exp: 15_000_000_000,
  },
  {
    id: 27,
    name: 'upgrades.upgrade_27',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 120),
    clicks: 120_000_000_000,
    level: 110,
    exp: 35_000_000_000,
  },
  {
    id: 28,
    name: 'upgrades.upgrade_28',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 125),
    clicks: 300_000_000_000,
    level: 120,
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
    price: new Decimal('2e33'),
    clicks: 4_500_000_000_000,
    level: 150,
    exp: 900_000_000_000,
  },
  {
    id: 32,
    name: 'upgrades.upgrade_32',
    image: '/assets/upgrades/general.webp',
    price: new Decimal('4e34'),
    clicks: 140_000_000_000_000,
    level: 175,
    exp: 18_000_000_000_000,
  },
  {
    id: 33,
    name: 'upgrades.upgrade_33',
    image: '/assets/upgrades/general.webp',
    price: new Decimal('7e35'),
    clicks: 4_200_000_000_000_000,
    level: 200,
    exp: 360_000_000_000_000,
  },
];

const LATE_UPGRADE_META: Array<Pick<UpgradeModel, 'id' | 'name' | 'level'>> = [
  { id: 34, name: 'upgrades.upgrade_34', level: 225 },
  { id: 35, name: 'upgrades.upgrade_35', level: 250 },
  { id: 36, name: 'upgrades.upgrade_36', level: 275 },
  { id: 37, name: 'upgrades.upgrade_37', level: 300 },
  { id: 38, name: 'upgrades.upgrade_38', level: 325 },
  { id: 39, name: 'upgrades.upgrade_39', level: 350 },
  { id: 40, name: 'upgrades.upgrade_40', level: 375 },
  { id: 41, name: 'upgrades.upgrade_41', level: 400 },
  { id: 42, name: 'upgrades.upgrade_42', level: 450 },
  { id: 43, name: 'upgrades.upgrade_43', level: 500 },
  { id: 44, name: 'upgrades.upgrade_44', level: 550 },
  { id: 45, name: 'upgrades.upgrade_45', level: 600 },
  { id: 46, name: 'upgrades.upgrade_46', level: 700 },
  { id: 47, name: 'upgrades.upgrade_47', level: 800 },
  { id: 48, name: 'upgrades.upgrade_48', level: 900 },
  { id: 49, name: 'upgrades.upgrade_49', level: 1000 },
  { id: 50, name: 'upgrades.upgrade_50', level: 1050 },
];

const BALANCED_CORE_UPGRADES: UpgradeModel[] = CORE_UPGRADES.map((upgrade) => ({
  ...upgrade,
  price: calculateBalancedUpgradePrice(upgrade.clicks, upgrade.level),
}));

const LAST_CORE_UPGRADE = BALANCED_CORE_UPGRADES[BALANCED_CORE_UPGRADES.length - 1];

const LATE_UPGRADES: UpgradeModel[] = LATE_UPGRADE_META.map((upgrade, index) => ({
  id: upgrade.id,
  name: upgrade.name,
  image: '/assets/upgrades/general.webp',
  clicks: calculateLateValue(LAST_CORE_UPGRADE.clicks, 8, index + 1),
  level: upgrade.level,
  exp: calculateLateValue(LAST_CORE_UPGRADE.clicks * 0.08, 8, index + 1),
  price: calculateBalancedUpgradePrice(
    calculateLateValue(LAST_CORE_UPGRADE.clicks, 8, index + 1),
    upgrade.level,
  ),
}));

export const UPGRADES: UpgradeModel[] = [...BALANCED_CORE_UPGRADES, ...LATE_UPGRADES];
