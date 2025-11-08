import { UpgradeModel } from "app/models/upgrade.model";

export const UPGRADES: UpgradeModel[] = [

  // ============================================================
  // 🥇 EARLY GAME - Primeras mejoras para arrancar el juego
  // ============================================================
  { id: 1, name: 'Dedo rápido', image: '/assets/producers/click.webp', price: 20, clicks: 1, level: 0, exp: 5 },
  { id: 2, name: 'Clic doble', image: '/assets/producers/click.webp', price: 50, clicks: 2, level: 0, exp: 10 },
  { id: 3, name: 'Dedo firme', image: '/assets/producers/click.webp', price: 120, clicks: 3, level: 2, exp: 15 },
  { id: 4, name: 'Dedo extra', image: '/assets/producers/click.webp', price: 300, clicks: 5, level: 3, exp: 25 },
  { id: 5, name: 'Tenedor', image: '/assets/producers/click.webp', price: 750, clicks: 10, level: 4, exp: 40 },
  { id: 6, name: 'Cuchara', image: '/assets/producers/click.webp', price: 1800, clicks: 20, level: 5, exp: 80 },
  { id: 7, name: 'Dedo aceitoso', image: '/assets/producers/click.webp', price: 4000, clicks: 40, level: 6, exp: 160 },
  { id: 8, name: 'Click crujiente', image: '/assets/producers/click.webp', price: 9500, clicks: 80, level: 7, exp: 320 },
  { id: 9, name: 'Más bechamel', image: '/assets/producers/click.webp', price: 20000, clicks: 150, level: 8, exp: 600 },
  { id: 10, name: 'Mano experta', image: '/assets/producers/click.webp', price: 45000, clicks: 300, level: 9, exp: 1200 },

  // ============================================================
  // ⚙️ MID GAME - Mejoras intermedias y de eficiencia
  // ============================================================
  { id: 11, name: 'Toque de Abuela', image: '/assets/producers/click.webp', price: 100000, clicks: 600, level: 10, exp: 2400 },
  { id: 12, name: 'Clic caliente', image: '/assets/producers/click.webp', price: 220000, clicks: 1200, level: 11, exp: 4800 },
  { id: 13, name: 'Dedo empanado', image: '/assets/producers/click.webp', price: 500000, clicks: 2500, level: 12, exp: 10000 },
  { id: 14, name: 'Click de Jamón', image: '/assets/producers/click.webp', price: 1100000, clicks: 5000, level: 13, exp: 20000 },
  { id: 15, name: 'Fritura rápida', image: '/assets/producers/click.webp', price: 2500000, clicks: 10000, level: 14, exp: 40000 },
  { id: 16, name: 'Doble empanado', image: '/assets/producers/click.webp', price: 6000000, clicks: 20000, level: 15, exp: 80000 },
  { id: 17, name: 'Mano Santa', image: '/assets/producers/click.webp', price: 14000000, clicks: 40000, level: 16, exp: 160000 },
  { id: 18, name: 'Dedo de Oro', image: '/assets/producers/click.webp', price: 35000000, clicks: 85000, level: 17, exp: 340000 },
  { id: 19, name: 'Toque maestro', image: '/assets/producers/click.webp', price: 80000000, clicks: 160000, level: 18, exp: 640000 },
  { id: 20, name: 'Fritura perfecta', image: '/assets/producers/click.webp', price: 200000000, clicks: 350000, level: 19, exp: 1400000 },

  // ============================================================
  // 🔥 LATE GAME - Mejoras avanzadas y de gran poder
  // ============================================================
  { id: 21, name: 'Clic industrial', image: '/assets/producers/click.webp', price: 500000000, clicks: 700000, level: 20, exp: 3500000 },
  { id: 22, name: 'Dedo biónico', image: '/assets/producers/click.webp', price: 1200000000, clicks: 1500000, level: 22, exp: 7500000 },
  { id: 23, name: 'Croqueta platino', image: '/assets/producers/click.webp', price: 3000000000, clicks: 3000000, level: 24, exp: 15000000 },
  { id: 24, name: 'Clic de Chef', image: '/assets/producers/click.webp', price: 7500000000, clicks: 6500000, level: 26, exp: 32500000 },
  { id: 25, name: 'Dedo-Queta', image: '/assets/producers/click.webp', price: 20000000000, clicks: 12000000, level: 28, exp: 60000000 },
  { id: 26, name: 'Croquetificar', image: '/assets/producers/click.webp', price: 55000000000, clicks: 25000000, level: 30, exp: 125000000 },
  { id: 27, name: 'Clic cuántico', image: '/assets/producers/click.webp', price: 150000000000, clicks: 50000000, level: 32, exp: 250000000 },
  { id: 28, name: 'Dedo fractal', image: '/assets/producers/click.webp', price: 400000000000, clicks: 100000000, level: 34, exp: 500000000 },
  { id: 29, name: 'El click', image: '/assets/producers/click.webp', price: 1000000000000, clicks: 220000000, level: 36, exp: 1100000000 },
  { id: 30, name: 'La croqueta', image: '/assets/producers/click.webp', price: 1000000000000000, clicks: 500000000, level: 38, exp: 2500000000 },
];
