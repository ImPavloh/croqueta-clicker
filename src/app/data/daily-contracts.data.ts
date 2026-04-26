import {
  DailyContractDefinition,
  DailyContractGenerationContext,
  DailyContractReward,
} from '@models/daily-contract.model';

function roundToStep(value: number, step: number): number {
  return Math.max(step, Math.ceil(value / step) * step);
}

function pointsReward(seconds: number): DailyContractReward {
  return {
    type: 'points',
    value: seconds,
  };
}

function multiplierReward(value: number, durationSeconds: number): DailyContractReward {
  return {
    type: 'multiplier',
    value,
    durationSeconds,
  };
}

function goldenReward(value: number): DailyContractReward {
  return {
    type: 'golden_croquetas',
    value,
  };
}

function getEconomyTier(context: DailyContractGenerationContext): number {
  return Math.max(0, Math.floor(Math.log10(Math.max(1, context.croquetasPerSecond + 1))));
}

function getContractScale(context: DailyContractGenerationContext): number {
  return Math.max(
    1,
    context.prestigeLevel +
      Math.floor(context.level / 18) +
      Math.floor(getEconomyTier(context) / 2),
  );
}

function getRewardScale(context: DailyContractGenerationContext): number {
  return Math.max(
    1,
    context.prestigeLevel + Math.floor(context.level / 24) + getEconomyTier(context),
  );
}

export const DAILY_CONTRACT_DEFINITIONS: DailyContractDefinition[] = [
  {
    id: 'click_warmup',
    metric: 'manual_clicks',
    icon: '🖱️',
    titleKey: 'contracts.definitions.clickWarmup.title',
    descriptionKey: 'contracts.definitions.clickWarmup.description',
    maxLevel: 12,
    target: (context) => roundToStep(70 + context.level * 12 + getEconomyTier(context) * 10, 20),
    reward: (context) => pointsReward(420 + getRewardScale(context) * 90),
  },
  {
    id: 'click_sprint',
    metric: 'manual_clicks',
    icon: '🖱️',
    titleKey: 'contracts.definitions.clickSprint.title',
    descriptionKey: 'contracts.definitions.clickSprint.description',
    minLevel: 6,
    target: (context) =>
      roundToStep(120 + getContractScale(context) * 35 + getEconomyTier(context) * 10, 25),
    reward: (context) => pointsReward(600 + getRewardScale(context) * 120),
  },
  {
    id: 'click_marathon',
    metric: 'manual_clicks',
    icon: '🖱️',
    titleKey: 'contracts.definitions.clickMarathon.title',
    descriptionKey: 'contracts.definitions.clickMarathon.description',
    minLevel: 28,
    minCroquetasPerSecond: 15,
    target: (context) =>
      roundToStep(220 + getContractScale(context) * 45 + getEconomyTier(context) * 20, 50),
    reward: (context) => multiplierReward(Math.min(2.3, 1.5 + getRewardScale(context) * 0.08), 720),
  },
  {
    id: 'click_overdrive',
    metric: 'manual_clicks',
    icon: '🖱️',
    titleKey: 'contracts.definitions.clickOverdrive.title',
    descriptionKey: 'contracts.definitions.clickOverdrive.description',
    minLevel: 70,
    minCroquetasPerSecond: 2_000,
    target: (context) =>
      roundToStep(420 + getContractScale(context) * 60 + getEconomyTier(context) * 30, 50),
    reward: (context) => {
      if (context.prestigeLevel >= 3) {
        return goldenReward(1);
      }

      return multiplierReward(2, 900);
    },
  },
  {
    id: 'level_spark',
    metric: 'levels_gained',
    icon: '📈',
    titleKey: 'contracts.definitions.levelSpark.title',
    descriptionKey: 'contracts.definitions.levelSpark.description',
    maxLevel: 18,
    target: (context) => Math.min(4, 1 + Math.max(1, Math.floor((context.level + 4) / 8))),
    reward: (context) => pointsReward(540 + getRewardScale(context) * 90),
  },
  {
    id: 'level_push',
    metric: 'levels_gained',
    icon: '📈',
    titleKey: 'contracts.definitions.levelPush.title',
    descriptionKey: 'contracts.definitions.levelPush.description',
    minLevel: 10,
    target: (context) =>
      Math.min(
        7,
        2 + Math.max(1, Math.floor(context.level / 20)) + Math.floor(getEconomyTier(context) / 2),
      ),
    reward: (context) => multiplierReward(Math.min(2.2, 1.4 + getRewardScale(context) * 0.06), 900),
  },
  {
    id: 'level_breakthrough',
    metric: 'levels_gained',
    icon: '📈',
    titleKey: 'contracts.definitions.levelBreakthrough.title',
    descriptionKey: 'contracts.definitions.levelBreakthrough.description',
    minLevel: 38,
    minCroquetasPerSecond: 40,
    target: (context) =>
      Math.min(9, 3 + Math.floor(context.level / 25) + Math.floor(getEconomyTier(context) / 2)),
    reward: (context) => {
      if (context.prestigeLevel >= 2) {
        return goldenReward(1);
      }

      return multiplierReward(Math.min(2.5, 1.7 + getRewardScale(context) * 0.05), 840);
    },
  },
  {
    id: 'producer_bootstrap',
    metric: 'producer_purchases',
    icon: '🏭',
    titleKey: 'contracts.definitions.producerBootstrap.title',
    descriptionKey: 'contracts.definitions.producerBootstrap.description',
    maxLevel: 16,
    target: (context) => roundToStep(4 + getContractScale(context) + getEconomyTier(context), 2),
    reward: (context) => pointsReward(720 + getRewardScale(context) * 90),
  },
  {
    id: 'producer_spree',
    metric: 'producer_purchases',
    icon: '🏭',
    titleKey: 'contracts.definitions.producerSpree.title',
    descriptionKey: 'contracts.definitions.producerSpree.description',
    minLevel: 8,
    target: (context) =>
      roundToStep(6 + getContractScale(context) * 2 + getEconomyTier(context), 2),
    reward: (context) => pointsReward(900 + getRewardScale(context) * 150),
  },
  {
    id: 'producer_fleet',
    metric: 'producer_purchases',
    icon: '🏭',
    titleKey: 'contracts.definitions.producerFleet.title',
    descriptionKey: 'contracts.definitions.producerFleet.description',
    minLevel: 30,
    minCroquetasPerSecond: 20,
    target: (context) =>
      roundToStep(10 + getContractScale(context) * 2 + getEconomyTier(context) * 2, 2),
    reward: (context) => multiplierReward(Math.min(2.1, 1.5 + getRewardScale(context) * 0.05), 780),
  },
  {
    id: 'producer_empire',
    metric: 'producer_purchases',
    icon: '🏭',
    titleKey: 'contracts.definitions.producerEmpire.title',
    descriptionKey: 'contracts.definitions.producerEmpire.description',
    minLevel: 75,
    minCroquetasPerSecond: 1_500,
    target: (context) =>
      roundToStep(14 + getContractScale(context) * 3 + getEconomyTier(context) * 2, 2),
    reward: (context) => {
      if (context.prestigeLevel >= 4) {
        return goldenReward(2);
      }

      return multiplierReward(2.1, 900);
    },
  },
  {
    id: 'upgrade_hunt',
    metric: 'upgrade_purchases',
    icon: '🧠',
    titleKey: 'contracts.definitions.upgradeHunt.title',
    descriptionKey: 'contracts.definitions.upgradeHunt.description',
    minLevel: 5,
    requiresRemainingUpgrades: true,
    target: (context) =>
      Math.min(4, Math.max(1, 1 + Math.floor((context.level + getEconomyTier(context) * 8) / 30))),
    reward: (context) => {
      if (context.prestigeLevel >= 2) {
        return goldenReward(1);
      }
      return multiplierReward(1.6, 600);
    },
  },
  {
    id: 'upgrade_sweep',
    metric: 'upgrade_purchases',
    icon: '🧠',
    titleKey: 'contracts.definitions.upgradeSweep.title',
    descriptionKey: 'contracts.definitions.upgradeSweep.description',
    minLevel: 20,
    minCroquetasPerSecond: 15,
    requiresRemainingUpgrades: true,
    target: (context) =>
      Math.min(6, 2 + Math.floor(context.level / 35) + Math.floor(getEconomyTier(context) / 2)),
    reward: (context) => pointsReward(1_080 + getRewardScale(context) * 120),
  },
  {
    id: 'upgrade_forge',
    metric: 'upgrade_purchases',
    icon: '🧠',
    titleKey: 'contracts.definitions.upgradeForge.title',
    descriptionKey: 'contracts.definitions.upgradeForge.description',
    minLevel: 60,
    minCroquetasPerSecond: 400,
    requiresRemainingUpgrades: true,
    target: (context) =>
      Math.min(7, 3 + Math.floor(context.level / 45) + Math.floor(getEconomyTier(context) / 2)),
    reward: (context) => {
      if (context.prestigeLevel >= 2) {
        return goldenReward(1);
      }

      return multiplierReward(1.9, 720);
    },
  },
  {
    id: 'event_hunter',
    metric: 'event_captures',
    icon: '✨',
    titleKey: 'contracts.definitions.eventHunter.title',
    descriptionKey: 'contracts.definitions.eventHunter.description',
    minLevel: 8,
    target: () => 1,
    reward: (context) => {
      if (context.prestigeLevel >= 1) {
        return goldenReward(1);
      }
      return pointsReward(1_200 + getRewardScale(context) * 90);
    },
  },
  {
    id: 'event_rush',
    metric: 'event_captures',
    icon: '✨',
    titleKey: 'contracts.definitions.eventRush.title',
    descriptionKey: 'contracts.definitions.eventRush.description',
    minLevel: 36,
    minCroquetasPerSecond: 120,
    target: () => 2,
    reward: () => multiplierReward(1.8, 780),
  },
  {
    id: 'event_storm',
    metric: 'event_captures',
    icon: '✨',
    titleKey: 'contracts.definitions.eventStorm.title',
    descriptionKey: 'contracts.definitions.eventStorm.description',
    minLevel: 90,
    minCroquetasPerSecond: 8_000,
    target: () => 3,
    reward: (context) => {
      if (context.prestigeLevel >= 3) {
        return goldenReward(2);
      }

      return multiplierReward(2.2, 900);
    },
  },
  {
    id: 'prestige_ready',
    metric: 'prestiges',
    icon: '🥇',
    titleKey: 'contracts.definitions.prestigeReady.title',
    descriptionKey: 'contracts.definitions.prestigeReady.description',
    requiresPrestigeReady: true,
    target: () => 1,
    reward: (context) =>
      goldenReward(Math.max(1, Math.min(3, 1 + Math.floor(context.prestigeLevel / 5)))),
  },
];
