/**
 * Modelos para el sistema de informes y estadísticas.
 */

/** Estadísticas de productores para el informe */
export interface ProducerReportData {
  readonly id: number;
  readonly name: string;
  readonly quantity: number;
  readonly cpsContribution: number;
  readonly cpsPercentage: number;
}

/** Estadísticas de mejoras para el informe */
export interface UpgradeReportData {
  readonly id: number;
  readonly name: string;
  readonly bought: boolean;
  readonly clicks: number;
  readonly level: number;
}

/** Estadísticas de logros para el informe */
export interface AchievementReportData {
  readonly id: string;
  readonly title: string;
  readonly unlocked: boolean;
}

/** Datos de skin para la tabla de skins del informe */
export interface SkinReportData {
  readonly id: number;
  readonly name: string;
  readonly rarity: string;
  readonly unlocked: boolean;
  readonly requirement: string;
}

/** Resumen del jugador que contiene todas las estadísticas agregadas del juego */
export interface GameSummary {
  readonly totalCroquetas: string;
  readonly croquetasPerSecond: string;
  readonly croquetasPerClick: string;
  readonly totalClicks: number;
  readonly level: number;
  readonly currentExp: number;
  readonly expToNext: number;
  readonly expProgress: number;
  readonly timePlaying: number;
  readonly timePlayingFormatted: string;
  readonly multiplier: number;
  readonly achievementsUnlocked: number;
  readonly achievementsTotal: number;
  readonly achievementsPercentage: number;
  readonly skinsUnlocked: number;
  readonly skinsTotal: number;
  readonly skinsPercentage: number;
  readonly upgradesBought: number;
  readonly upgradesTotal: number;
  readonly upgradesPercentage: number;
  readonly totalProducers: number;
  readonly prestigeLevel: number;
  readonly goldenCroquetas: number;
  readonly prestigeMultiplier: number;
  readonly generatedAt: string;
}

/** Métricas y ratios de eficiencia */
export interface EfficiencyData {
  readonly croquetasPerClick: string;
  readonly clicksPerMinute: number;
  readonly croquetasPerMinute: string;
  readonly avgCpsPerProducer: string;
  readonly topProducer: string;
  readonly topProducerCps: string;
  readonly upgradeEfficiency: string;
  readonly skinsCompletionRate: string;
  readonly totalUpgradeCost: string;
}

/** Información de depuración para el estado interno del juego */
export interface DebugInfoData {
  readonly debugEnabled: boolean;
  readonly lastSaveTime: string;
  readonly storageKeys: number;
  readonly storageSizeKb: number;
  readonly lang: string;
  readonly gameItemsVersion: number;
}

/** Punto de datos para gráficos (elemento genérico de gráfico de barras) */
export interface ChartItem {
  readonly name: string;
  readonly value: number;
}

/** Punto de datos para barras de progreso */
export interface ProgressBarItem {
  readonly label: string;
  readonly current: number;
  readonly total: number;
  readonly percentage: number;
}

/** Punto de datos para gráficos de dona con porcentaje */
export interface DonutChartItem {
  readonly name: string;
  readonly value: number;
  readonly percentage: number;
}

/** Datos de fila para tablas */
export interface TableRow {
  readonly label: string;
  readonly value: string;
}

/** Payload de exportación PDF con todos los datos del informe y etiquetas localizadas */
export interface ReportPdfPayload {
  readonly summary: GameSummary;
  readonly producers: ProducerReportData[];
  readonly upgrades: UpgradeReportData[];
  readonly achievements: AchievementReportData[];
  readonly efficiency: EfficiencyData;
  readonly upgradesByLevel: ChartItem[];
  readonly upgradeClickCurve: ChartItem[];
  readonly cumulativeUpgradeCurve: ChartItem[];
  readonly achievementsStatus: DonutChartItem[];
  readonly skinRarity: ChartItem[];
  readonly leaderboardStats?: LeaderboardStats | null;
  readonly leaderboardTop?: LeaderboardTopEntry[] | null;
  readonly localeTitle: string;
  readonly labels: Readonly<Record<string, string>>;
  readonly debugInfo?: {
    readonly playerRows: string[][];
    readonly debugRows: string[][];
    readonly multiplayerRows: string[][];
  };
}

/** Estadísticas agregadas del leaderboard */
export interface LeaderboardStats {
  readonly totalPlayers: number;
  readonly avgLevel: number;
  readonly maxLevel: number;
  readonly minLevel: number;
  readonly lastUpdated?: string | null;
  readonly buckets: LeaderboardStatsBucket[];
}

/** Cubo de distribución de nivel/puntuación del leaderboard */
export interface LeaderboardStatsBucket {
  readonly label: string;
  readonly count: number;
}

/** Entrada de jugador destacado para el leaderboard */
export interface LeaderboardTopEntry {
  readonly username: string;
  readonly score: number;
}
