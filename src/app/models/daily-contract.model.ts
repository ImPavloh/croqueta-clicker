export type DailyContractMetric =
  | 'manual_clicks'
  | 'levels_gained'
  | 'producer_purchases'
  | 'upgrade_purchases'
  | 'event_captures'
  | 'prestiges';

export type DailyContractRewardType = 'points' | 'multiplier' | 'golden_croquetas';

export interface DailyContractReward {
  type: DailyContractRewardType;
  value: number;
  durationSeconds?: number;
}

export interface DailyContractGenerationContext {
  level: number;
  prestigeLevel: number;
  croquetasPerSecond: number;
  remainingUpgrades: number;
  canPrestige: boolean;
}

export interface DailyContractDefinition {
  id: string;
  metric: DailyContractMetric;
  icon: string;
  titleKey: string;
  descriptionKey: string;
  minLevel?: number;
  maxLevel?: number;
  minCroquetasPerSecond?: number;
  requiresRemainingUpgrades?: boolean;
  requiresPrestigeReady?: boolean;
  target: (context: DailyContractGenerationContext) => number;
  reward: (context: DailyContractGenerationContext) => DailyContractReward;
}

export interface ActiveDailyContract {
  id: string;
  definitionId: string;
  metric: DailyContractMetric;
  icon: string;
  titleKey: string;
  descriptionKey: string;
  target: number;
  progress: number;
  reward: DailyContractReward;
  claimed: boolean;
}

export interface DailyContractsMetrics {
  manual_clicks: number;
  levels_gained: number;
  producer_purchases: number;
  upgrade_purchases: number;
  event_captures: number;
  prestiges: number;
}

export interface DailyContractsObservedState {
  totalClicks: number;
  level: number;
}

export interface DailyContractsAggregateStats {
  currentStreak: number;
  bestStreak: number;
  weeklyCompletedDays: number;
  weekKey: string;
  lastCompletedDateKey: string | null;
  lifetimeClaimedContracts: number;
  lifetimeCompletedDays: number;
  lifetimeBonusClaims: number;
}

export interface DailyContractBonusState {
  reward: DailyContractReward | null;
  claimed: boolean;
}

export interface DailyContractsState {
  dateKey: string;
  contracts: ActiveDailyContract[];
  metrics: DailyContractsMetrics;
  lastObserved: DailyContractsObservedState;
  bonus: DailyContractBonusState;
  stats: DailyContractsAggregateStats;
}
