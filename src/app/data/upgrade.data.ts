import { UpgradeModel } from '@models/upgrade.model';
import Decimal from 'break_infinity.js';

function calculatePrice(baseLevel: Decimal, basePrice: Decimal, targetLevel: number): Decimal {
  const newTargetLevel = new Decimal(targetLevel);
  // Factor exponencial basado en la diferencia de niveles
  const levelDiff = newTargetLevel.minus(baseLevel);

  // Base multiplicadora que escala con el nivel
  // AJUSTE: Se reduce la base del multiplicador y se elimina el escalado por nivel.
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
  // 🥇 EARLY GAME - (Niveles 1-35) - CLICKS MUY RELEVANTES
  // Los clicks deben competir con productores early, precio accesible
  // ============================================================
  {
    id: 1,
    name: 'upgrades.upgrade_1',
    image: '/assets/upgrades/general.webp',
    price: precioBase,
    clicks: 3, // +3 clicks (con 1 inicial = 4 total, muy fuerte inicio)
    level: 2,
    exp: 5,
  },
  {
    id: 2,
    name: 'upgrades.upgrade_2',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 4),
    clicks: 7, // +7 (total 11, supera fácilmente productor 1)
    level: 4,
    exp: 8,
  },
  {
    id: 3,
    name: 'upgrades.upgrade_3',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 7),
    clicks: 15, // +15 (total 26, compite con productor 2)
    level: 7,
    exp: 12,
  },
  {
    id: 4,
    name: 'upgrades.upgrade_4',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 10),
    clicks: 35, // +35 (total 61, clicks siguen siendo relevantes)
    level: 10,
    exp: 25,
  },
  {
    id: 5,
    name: 'upgrades.upgrade_5',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 13),
    clicks: 80, // +80 (total 141)
    level: 13,
    exp: 45,
  },
  {
    id: 6,
    name: 'upgrades.upgrade_6',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 17),
    clicks: 180, // +180 (total 321)
    level: 17,
    exp: 90,
  },
  {
    id: 7,
    name: 'upgrades.upgrade_7',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 21),
    clicks: 400, // +400 (total 721, compite con prod 3-4)
    level: 21,
    exp: 180,
  },
  {
    id: 8,
    name: 'upgrades.upgrade_8',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 25),
    clicks: 900, // +900 (total 1621)
    level: 25,
    exp: 360,
  },
  {
    id: 9,
    name: 'upgrades.upgrade_9',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 30),
    clicks: 2_000, // +2k (total 3621)
    level: 30,
    exp: 700,
  },
  {
    id: 10,
    name: 'upgrades.upgrade_10',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 35),
    clicks: 4_500, // +4.5k (total 8121, clicks = ~3-4 seg de CPS)
    level: 35,
    exp: 1_400,
  },

  // ============================================================
  // ⚙️ MID GAME - (Niveles 40-85) - MANTENER CLICKS ATRACTIVOS
  // Cada upgrade debe equivaler a 5-10 segundos de CPS del nivel
  // ============================================================
  {
    id: 11,
    name: 'upgrades.upgrade_11',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 40),
    clicks: 10_000, // +10k (total 18k)
    level: 40,
    exp: 3_000,
  },
  {
    id: 12,
    name: 'upgrades.upgrade_12',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 45),
    clicks: 22_000, // +22k (total 40k)
    level: 45,
    exp: 6_000,
  },
  {
    id: 13,
    name: 'upgrades.upgrade_13',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 50),
    clicks: 50_000, // +50k (total 90k)
    level: 50,
    exp: 12_000,
  },
  {
    id: 14,
    name: 'upgrades.upgrade_14',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 55),
    clicks: 110_000, // +110k (total 200k)
    level: 55,
    exp: 25_000,
  },
  {
    id: 15,
    name: 'upgrades.upgrade_15',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 60),
    clicks: 250_000, // +250k (total 450k)
    level: 60,
    exp: 50_000,
  },
  {
    id: 16,
    name: 'upgrades.upgrade_16',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 65),
    clicks: 550_000, // +550k (total 1M)
    level: 65,
    exp: 100_000,
  },
  {
    id: 17,
    name: 'upgrades.upgrade_17',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 70),
    clicks: 1_200_000, // +1.2M (total 2.2M)
    level: 70,
    exp: 200_000,
  },
  {
    id: 18,
    name: 'upgrades.upgrade_18',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 75),
    clicks: 2_700_000, // +2.7M (total 4.9M)
    level: 75,
    exp: 400_000,
  },
  {
    id: 19,
    name: 'upgrades.upgrade_19',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 80),
    clicks: 6_000_000, // +6M (total 10.9M)
    level: 80,
    exp: 800_000,
  },
  {
    id: 20,
    name: 'upgrades.upgrade_20',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 85),
    clicks: 13_000_000, // +13M (total 23.9M)
    level: 85,
    exp: 1_700_000,
  },

  // ============================================================
  // 🔥 LATE GAME - (Niveles 90-140) - CLICKS SIGUEN SIENDO PODER
  // Cada click debe sentirse como un "mini productor"
  // ============================================================
  {
    id: 21,
    name: 'upgrades.upgrade_21',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 90),
    clicks: 30_000_000, // +30M (total 53.9M)
    level: 90,
    exp: 4_000_000,
  },
  {
    id: 22,
    name: 'upgrades.upgrade_22',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 95),
    clicks: 65_000_000, // +65M (total 118.9M)
    level: 95,
    exp: 8_500_000,
  },
  {
    id: 23,
    name: 'upgrades.upgrade_23',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 100),
    clicks: 145_000_000, // +145M (total 263.9M)
    level: 100,
    exp: 17_000_000,
  },
  {
    id: 24,
    name: 'upgrades.upgrade_24',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 105),
    clicks: 320_000_000, // +320M (total 583.9M)
    level: 105,
    exp: 35_000_000,
  },
  {
    id: 25,
    name: 'upgrades.upgrade_25',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 110),
    clicks: 700_000_000, // +700M (total 1.28B)
    level: 110,
    exp: 65_000_000,
  },
  {
    id: 26,
    name: 'upgrades.upgrade_26',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 115),
    clicks: 1_500_000_000, // +1.5B (total 2.78B)
    level: 115,
    exp: 135_000_000,
  },
  {
    id: 27,
    name: 'upgrades.upgrade_27',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 120),
    clicks: 3_300_000_000, // +3.3B (total 6.08B)
    level: 120,
    exp: 270_000_000,
  },
  {
    id: 28,
    name: 'upgrades.upgrade_28',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 125),
    clicks: 7_500_000_000, // +7.5B (total 13.58B)
    level: 125,
    exp: 540_000_000,
  },
  {
    id: 29,
    name: 'upgrades.upgrade_29',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 130),
    clicks: 16_000_000_000, // +16B (total 29.58B)
    level: 130,
    exp: 1_200_000_000,
  },
  {
    id: 30,
    name: 'upgrades.upgrade_30',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 140),
    clicks: 36_000_000_000, // +36B (total 65.58B)
    level: 140,
    exp: 2_700_000_000,
  },

  // ============================================================
  // 🌀 ENDGAME - (Niveles 150+) - CADA CLICK ES UN EVENTO ÉPICO
  // Los clicks deben competir con productores level 11+
  // ============================================================
  {
    id: 31,
    name: 'upgrades.upgrade_31',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 150),
    clicks: 80_000_000_000, // +80B (total 145.58B)
    level: 150,
    exp: 10_000_000_000,
  },
  {
    id: 32,
    name: 'upgrades.upgrade_32',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 200),
    clicks: 900_000_000_000, // +900B (total 1.04T)
    level: 200,
    exp: 100_000_000_000,
  },
  {
    id: 33,
    name: 'upgrades.upgrade_33',
    image: '/assets/upgrades/general.webp',
    price: calculatePrice(levelBase, precioBase, 300),
    clicks: 10_000_000_000_000, // +10T (total 11T, CLICKS = PODER)
    level: 300,
    exp: 1_000_000_000_000,
  },
];
