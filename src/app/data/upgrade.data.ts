import { UpgradeModel } from '@models/upgrade.model';

export const UPGRADES: UpgradeModel[] = [

  // ============================================================
  // 🥇 EARLY GAME - (Niveles 1-35) - Esta sección estaba bien equilibrada.
  // ============================================================
  { id: 1, name: 'Dedo rápido', image: '/assets/upgrades/general.webp', price: 100, clicks: 1, level: 2, exp: 5 },
  { id: 2, name: 'Click doble', image: '/assets/upgrades/general.webp', price: 300, clicks: 2, level: 4, exp: 8 },
  { id: 3, name: 'Dedo firme', image: '/assets/upgrades/general.webp', price: 2000, clicks: 3, level: 7, exp: 12 },
  { id: 4, name: 'Dedo extra', image: '/assets/upgrades/general.webp', price: 5000, clicks: 5, level: 10, exp: 25 },
  { id: 5, name: 'Tenedor', image: '/assets/upgrades/general.webp', price: 14_000, clicks: 10, level: 13, exp: 45 },
  { id: 6, name: 'Cuchara', image: '/assets/upgrades/general.webp', price: 100_000, clicks: 20, level: 17, exp: 90 },
  { id: 7, name: 'Dedo aceitoso', image: '/assets/upgrades/general.webp', price: 500_000, clicks: 40, level: 21, exp: 180 },
  { id: 8, name: 'Click crujiente', image: '/assets/upgrades/general.webp', price: 1_000_000, clicks: 80, level: 25, exp: 360 },
  { id: 9, name: 'Más bechamel', image: '/assets/upgrades/general.webp', price: 3_000_000, clicks: 150, level: 30, exp: 700 },
  { id: 10, name: 'Mano experta', image: '/assets/upgrades/general.webp', price: 7_500_000, clicks: 300, level: 35, exp: 1_400 },

  // ============================================================
  // ⚙️ MID GAME - (Niveles 40-85) - NIVELES REAJUSTADOS
  // ============================================================
  // Estos niveles ahora progresan lógicamente después del Nivel 35.
  { id: 11, name: 'Toque de Abuela', image: '/assets/upgrades/general.webp', price: 90_000, clicks: 600, level: 40, exp: 3_000 },
  { id: 12, name: 'Click caliente', image: '/assets/upgrades/general.webp', price: 200_000, clicks: 1_200, level: 45, exp: 6_000 },
  { id: 13, name: 'Dedo empanado', image: '/assets/upgrades/general.webp', price: 450_000, clicks: 2_500, level: 50, exp: 12_000 },
  { id: 14, name: 'Click de Jamón', image: '/assets/upgrades/general.webp', price: 1_000_000, clicks: 5_000, level: 55, exp: 25_000 },
  { id: 15, name: 'Fritura rápida', image: '/assets/upgrades/general.webp', price: 2_300_000, clicks: 10_000, level: 60, exp: 50_000 },
  { id: 16, name: 'Doble empanado', image: '/assets/upgrades/general.webp', price: 5_500_000, clicks: 20_000, level: 65, exp: 100_000 },
  { id: 17, name: 'Mano Santa', image: '/assets/upgrades/general.webp', price: 13_000_000, clicks: 40_000, level: 70, exp: 200_000 },
  { id: 18, name: 'Dedo de Oro', image: '/assets/upgrades/general.webp', price: 32_000_000, clicks: 85_000, level: 75, exp: 400_000 },
  { id: 19, name: 'Toque maestro', image: '/assets/upgrades/general.webp', price: 75_000_000, clicks: 160_000, level: 80, exp: 800_000 },
  { id: 20, name: 'Fritura perfecta', image: '/assets/upgrades/general.webp', price: 180_000_000, clicks: 350_000, level: 85, exp: 1_700_000 },

  // ============================================================
  // 🔥 LATE GAME - (Niveles 90-140) - NIVELES REAJUSTADOS
  // ============================================================
  // Estos niveles ahora progresan lógicamente después del Nivel 85.
  { id: 21, name: 'Click industrial', image: '/assets/upgrades/general.webp', price: 450_000_000, clicks: 700_000, level: 90, exp: 4_000_000 },
  { id: 22, name: 'Dedo biónico', image: '/assets/upgrades/general.webp', price: 1_100_000_000, clicks: 1_500_000, level: 95, exp: 8_500_000 },
  { id: 23, name: 'Croqueta platino', image: '/assets/upgrades/general.webp', price: 2_800_000_000, clicks: 3_000_000, level: 100, exp: 17_000_000 },
  { id: 24, name: 'Click de Chef', image: '/assets/upgrades/general.webp', price: 7_200_000_000, clicks: 6_500_000, level: 105, exp: 35_000_000 },
  { id: 25, name: 'Dedo-Queta', image: '/assets/upgrades/general.webp', price: 19_000_000_000, clicks: 12_000_000, level: 110, exp: 65_000_000 },
  { id: 26, name: 'Croquetificar', image: '/assets/upgrades/general.webp', price: 50_000_000_000, clicks: 25_000_000, level: 115, exp: 135_000_000 },
  { id: 27, name: 'Click cuántico', image: '/assets/upgrades/general.webp', price: 140_000_000_000, clicks: 50_000_000, level: 120, exp: 270_000_000 },
  { id: 28, name: 'Dedo fractal', image: '/assets/upgrades/general.webp', price: 380_000_000_000, clicks: 100_000_000, level: 125, exp: 540_000_000 },
  { id: 29, name: 'Click Infinito', image: '/assets/upgrades/general.webp', price: 950_000_000_000, clicks: 220_000_000, level: 130, exp: 1_200_000_000 },
  { id: 30, name: 'Click de Dios', image: '/assets/upgrades/general.webp', price: 95_000_000_000_000, clicks: 500_000_000, level: 140, exp: 2_700_000_000 },

  // ============================================================
  // 🌀 ENDGAME - (Niveles 150+) - Esta sección estaba bien.
  // ============================================================
  { id: 31, name: 'El click', image: '/assets/upgrades/general.webp', price: 12_000_000_000_000_000, clicks: 1_000_000_000, level: 150, exp: 10_000_000_000 },
  { id: 32, name: 'El rebozado', image: '/assets/upgrades/general.webp', price: 250_000_000_000_000_000, clicks: 10_000_000_000, level: 200, exp: 100_000_000_000 },
  { id: 33, name: 'La croqueta', image: '/assets/upgrades/general.webp', price: 5_000_000_000_000_000_000, clicks: 100_000_000_000, level: 300, exp: 1_000_000_000_000 },

];
