import { Injectable, inject } from '@angular/core';
import { PlayerStats } from './player-stats.service';
import { PointsService } from './points.service';
import { AchievementsService } from './achievements.service';
import { SkinsService } from './skins.service';
import { OptionsService } from './options.service';
import { PRODUCERS } from '@data/producer.data';
import { UPGRADES } from '@data/upgrade.data';
import { SKINS } from '@data/skin.data';
import { TranslocoService } from '@jsverse/transloco';
import { GAME_PREFIX } from '@app/config/constants';
import { DebugService } from '@services/debug.service';
import { PrestigeService } from '@services/prestige.service';
import { DailyContractsService } from '@services/daily-contracts.service';
import {
  DailyContractReportData,
  DailyContractSummaryData,
  ProducerReportData,
  UpgradeReportData,
  AchievementReportData,
  SkinReportData,
  GameSummary,
  EfficiencyData,
  DebugInfoData,
  ChartItem,
  ProgressBarItem,
  DonutChartItem,
} from '@models/report.model';

/**
 * Servicio que recopila y calcula todos los datos necesarios para
 * generar informes y estadísticas avanzadas del juego.
 */
@Injectable({ providedIn: 'root' })
export class ReportService {
  private playerStats = inject(PlayerStats);
  private pointsService = inject(PointsService);
  private achievementsService = inject(AchievementsService);
  private skinsService = inject(SkinsService);
  private optionsService = inject(OptionsService);
  private transloco = inject(TranslocoService);
  private debugService = inject(DebugService);
  private prestigeService = inject(PrestigeService);
  private dailyContracts = inject(DailyContractsService);

  /** Recopila el resumen general del juego */
  getGameSummary(): GameSummary {
    const achievementsUnlocked = this.achievementsService.getUnlockedCount();
    const achievementsTotal = this.achievementsService.getTotalCount();
    const skinsUnlocked = this.getUnlockedSkinsCount();
    const skinsTotal = SKINS.length;
    const upgradesBought = this.getBoughtUpgradesCount();
    const upgradesTotal = UPGRADES.length;
    const timePlaying = this.playerStats.timePlaying();
    const expToNext = this.playerStats.expToNext();
    const currentExp = this.playerStats.currentExp();

    return {
      totalCroquetas: this.pointsService.formatPoints(this.pointsService.points()),
      croquetasPerSecond: this.pointsService.formatPoints(this.pointsService.pointsPerSecond()),
      croquetasPerClick: this.pointsService.formatPoints(this.pointsService.pointsPerClick()),
      totalClicks: this.playerStats.totalClicks(),
      level: this.playerStats._level.value,
      currentExp,
      expToNext,
      expProgress: expToNext > 0 ? Math.round((currentExp / expToNext) * 100) : 0,
      timePlaying,
      timePlayingFormatted: this.formatTime(timePlaying),
      multiplier: this.pointsService.getActiveMultiplier(),
      achievementsUnlocked,
      achievementsTotal,
      achievementsPercentage:
        achievementsTotal > 0 ? Math.round((achievementsUnlocked / achievementsTotal) * 100) : 0,
      skinsUnlocked,
      skinsTotal,
      skinsPercentage: skinsTotal > 0 ? Math.round((skinsUnlocked / skinsTotal) * 100) : 0,
      upgradesBought,
      upgradesTotal,
      upgradesPercentage:
        upgradesTotal > 0 ? Math.round((upgradesBought / upgradesTotal) * 100) : 0,
      totalProducers: this.getTotalProducersCount(),
      prestigeLevel: this.prestigeService.prestigeLevel(),
      goldenCroquetas: this.prestigeService.goldenCroquetas(),
      prestigeMultiplier: this.prestigeService.prestigeMultiplier(),
      generatedAt: new Date().toLocaleString(),
    };
  }

  /** Recopila datos de todos los productores */
  getProducersData(): ProducerReportData[] {
    const producers: ProducerReportData[] = [];
    let totalCps = 0;

    // calcular CPS de cada productor
    for (const p of PRODUCERS) {
      const q = Number(this.optionsService.getGameItem('producer_' + p.id + '_quantity') || 0) || 0;
      if (q <= 0) {
        producers.push({
          id: p.id,
          name: p.name,
          quantity: 0,
          cpsContribution: 0,
          cpsPercentage: 0,
        });
        continue;
      }
      const base = p.pointsBase * q;
      const seq = (q * (q - 1)) / 2;
      const bonus = p.pointsSum * seq;
      const cps = base + bonus;
      totalCps += cps;
      producers.push({
        id: p.id,
        name: p.name,
        quantity: q,
        cpsContribution: cps,
        cpsPercentage: 0,
      });
    }

    // calcular porcentajes
    return producers.map((p) => ({
      ...p,
      cpsPercentage: totalCps > 0 ? Math.round((p.cpsContribution / totalCps) * 1000) / 10 : 0,
    }));
  }

  /** recopila datos de mejoras */
  getUpgradesData(): UpgradeReportData[] {
    return UPGRADES.map((u) => ({
      id: u.id,
      name: u.name,
      bought: this.optionsService.getGameItem('upgrade_' + u.id + '_bought') === 'true',
      clicks: u.clicks,
      level: u.level,
    }));
  }

  /** recopila datos de logros */
  getAchievementsData(): AchievementReportData[] {
    const allWithState = this.achievementsService.getAllWithState();
    return allWithState.map((a) => ({
      id: a.id,
      title: a.title,
      unlocked: a.unlocked,
    }));
  }

  /** calcula métricas de eficiencia */
  getEfficiencyData(): EfficiencyData {
    const timePlaying = this.playerStats.timePlaying();
    const totalClicks = this.playerStats.totalClicks();
    const minutes = timePlaying > 0 ? timePlaying / 60 : 1;
    const clicksPerMinute = Math.round((totalClicks / minutes) * 10) / 10;

    const cpsNum = this.pointsService.pointsPerSecond();
    const croquetasPerMinute = cpsNum.times(60);

    const producers = this.getProducersData();
    const activeProducers = producers.filter((p) => p.quantity > 0);
    const totalProducers = activeProducers.reduce((sum, p) => sum + p.quantity, 0);
    const totalCps = activeProducers.reduce((sum, p) => sum + p.cpsContribution, 0);

    const topProducer =
      activeProducers.length > 0
        ? activeProducers.reduce((best, p) => (p.cpsContribution > best.cpsContribution ? p : best))
        : null;

    // campos calculados nuevos
    const upgradesBought = this.getBoughtUpgradesCount();
    const playerLevel = this.playerStats._level.value;
    const upgradeEfficiency =
      playerLevel > 0 ? Math.round((upgradesBought / playerLevel) * 1000) / 10 : 0;
    const skinsUnlocked = this.getUnlockedSkinsCount();
    const skinsCompletion =
      SKINS.length > 0 ? Math.round((skinsUnlocked / SKINS.length) * 1000) / 10 : 0;
    let totalUpgradeCostNum = 0;
    for (const u of UPGRADES) {
      if (this.optionsService.getGameItem('upgrade_' + u.id + '_bought') === 'true') {
        totalUpgradeCostNum += typeof u.price === 'number' ? u.price : u.price.toNumber();
      }
    }

    return {
      croquetasPerClick: this.pointsService.formatPoints(this.pointsService.pointsPerClick()),
      clicksPerMinute,
      croquetasPerMinute: this.pointsService.formatPoints(croquetasPerMinute),
      avgCpsPerProducer:
        totalProducers > 0
          ? this.pointsService.formatPoints(Math.round(totalCps / totalProducers))
          : '0',
      topProducer: topProducer ? this.transloco.translate(topProducer.name) : '-',
      topProducerCps: topProducer
        ? this.pointsService.formatPoints(topProducer.cpsContribution)
        : '0',
      upgradeEfficiency: `${upgradeEfficiency}%`,
      skinsCompletionRate: `${skinsCompletion}%`,
      totalUpgradeCost: this.pointsService.formatPoints(totalUpgradeCostNum),
    };
  }

  /** histograma de niveles de productores comprados */
  getProducerDistribution(): ChartItem[] {
    return PRODUCERS.map((p) => {
      const q = Number(this.optionsService.getGameItem('producer_' + p.id + '_quantity') || 0) || 0;
      return { name: this.transloco.translate(p.name), value: q };
    }).filter((p) => p.value > 0);
  }

  /** distribución de CPS por productor */
  getCpsDistribution(): DonutChartItem[] {
    const producers = this.getProducersData().filter((p) => p.cpsContribution > 0);
    return producers.map((p) => ({
      name: this.transloco.translate(p.name),
      value: p.cpsContribution,
      percentage: p.cpsPercentage,
    }));
  }

  /** Curva de bonus de click según el nivel requerido de cada mejora */
  getUpgradeClickCurveData(): ChartItem[] {
    return [...UPGRADES]
      .sort((left, right) => left.level - right.level)
      .map((upgrade) => ({
        name: `L${upgrade.level}`,
        value: upgrade.clicks,
      }));
  }

  /** Evolución acumulada del bonus de click conforme se desbloquean mejoras */
  getUpgradeCumulativeCurveData(): ChartItem[] {
    let accumulated = 0;

    return [...UPGRADES]
      .sort((left, right) => left.level - right.level)
      .map((upgrade) => {
        accumulated += upgrade.clicks;
        return {
          name: `L${upgrade.level}`,
          value: accumulated,
        };
      });
  }

  /** datos para gráfico de progreso (resumidos) */
  getProgressData(): ProgressBarItem[] {
    const summary = this.getGameSummary();
    return [
      {
        label: this.transloco.translate('report.achievements'),
        current: summary.achievementsUnlocked,
        total: summary.achievementsTotal,
        percentage: summary.achievementsPercentage,
      },
      {
        label: this.transloco.translate('report.upgrades'),
        current: summary.upgradesBought,
        total: summary.upgradesTotal,
        percentage: summary.upgradesPercentage,
      },
      {
        label: this.transloco.translate('report.skins'),
        current: summary.skinsUnlocked,
        total: summary.skinsTotal,
        percentage: summary.skinsPercentage,
      },
    ];
  }

  getDailyContractSummaryData(): DailyContractSummaryData {
    const state = this.dailyContracts.getSnapshot();
    const completed = state.contracts.filter(
      (contract) => contract.progress >= contract.target,
    ).length;
    const claimed = state.contracts.filter((contract) => contract.claimed).length;
    const total = state.contracts.length;

    return {
      total,
      completed,
      claimed,
      claimable: state.contracts.filter(
        (contract) => contract.progress >= contract.target && !contract.claimed,
      ).length,
      completionPercentage: total > 0 ? Math.round((claimed / total) * 100) : 0,
      resetTimeLabel: this.dailyContracts.resetTimeLabel(),
      currentStreak: state.stats.currentStreak,
      bestStreak: state.stats.bestStreak,
      weeklyCompletedDays: state.stats.weeklyCompletedDays,
      lifetimeClaimedContracts: state.stats.lifetimeClaimedContracts,
      lifetimeCompletedDays: state.stats.lifetimeCompletedDays,
      lifetimeBonusClaims: state.stats.lifetimeBonusClaims,
      bonusRewardLabel: state.bonus.reward
        ? this.formatDailyContractReward(state.bonus.reward)
        : '-',
      bonusClaimed: state.bonus.claimed,
      bonusAvailable:
        state.contracts.length > 0 &&
        state.contracts.every((contract) => contract.progress >= contract.target) &&
        !state.bonus.claimed,
      manualClicks: state.metrics.manual_clicks,
      levelsGained: state.metrics.levels_gained,
      producerPurchases: state.metrics.producer_purchases,
      upgradePurchases: state.metrics.upgrade_purchases,
      eventCaptures: state.metrics.event_captures,
      prestiges: state.metrics.prestiges,
    };
  }

  getDailyContractsData(): DailyContractReportData[] {
    const state = this.dailyContracts.getSnapshot();

    return state.contracts.map((contract) => ({
      id: contract.id,
      icon: contract.icon,
      title: this.transloco.translate(contract.titleKey, { target: contract.target }),
      description: this.transloco.translate(contract.descriptionKey),
      progress: contract.progress,
      target: contract.target,
      percentage:
        contract.target > 0
          ? Math.max(0, Math.min(100, Math.round((contract.progress / contract.target) * 100)))
          : 0,
      rewardLabel: this.formatDailyContractReward(contract.reward),
      claimed: contract.claimed,
      completed: contract.progress >= contract.target,
    }));
  }

  getDailyContractProgressData(): ProgressBarItem[] {
    return this.getDailyContractsData().map((contract) => ({
      label: `${contract.icon} ${contract.title}`,
      current: contract.progress,
      total: contract.target,
      percentage: contract.percentage,
    }));
  }

  getUpgradeLevelDistribution(): ChartItem[] {
    const buckets = [
      { key: 'report.levelRange.0_20', min: 0, max: 21 },
      { key: 'report.levelRange.21_50', min: 21, max: 51 },
      { key: 'report.levelRange.51_100', min: 51, max: 101 },
      { key: 'report.levelRange.101_200', min: 101, max: 201 },
      { key: 'report.levelRange.201_400', min: 201, max: 401 },
      { key: 'report.levelRange.401_800', min: 401, max: 801 },
      { key: 'report.levelRange.801_plus', min: 801 },
    ];

    return buckets.map((b) => {
      const count = UPGRADES.filter((u) => {
        if (typeof b.max === 'number') return u.level >= b.min && u.level < b.max;
        return u.level >= b.min;
      }).length;

      return { name: this.transloco.translate(b.key), value: count };
    });
  }

  getAchievementStatusDistribution(): DonutChartItem[] {
    const unlocked = this.achievementsService.getUnlockedCount();
    const total = this.achievementsService.getTotalCount();
    const locked = Math.max(0, total - unlocked);
    const pct = total > 0 ? Math.round((unlocked / total) * 1000) / 10 : 0;

    return [
      {
        name: this.transloco.translate('report.achUnlocked'),
        value: unlocked,
        percentage: pct,
      },
      {
        name: this.transloco.translate('report.achLocked'),
        value: locked,
        percentage: Math.round((100 - pct) * 10) / 10,
      },
    ];
  }

  getSkinRarityDistribution(): ChartItem[] {
    const map = new Map<string, number>();
    for (const skin of SKINS) {
      const key = skin.rarity ?? 'skins.rarity.common';
      map.set(key, (map.get(key) ?? 0) + 1);
    }

    const order = [
      'skins.rarity.common',
      'skins.rarity.rare',
      'skins.rarity.epic',
      'skins.rarity.legendary',
      'skins.rarity.mythic',
    ];
    const sorted = Array.from(map.entries()).sort(
      (a, b) => order.indexOf(a[0]) - order.indexOf(b[0]),
    );
    return sorted.map(([key, value]) => ({
      name: this.transloco.translate(key),
      value,
    }));
  }

  private formatDailyContractReward(reward: {
    type: 'points' | 'multiplier' | 'golden_croquetas';
    value: number;
    durationSeconds?: number;
  }): string {
    switch (reward.type) {
      case 'points':
        return this.transloco.translate('contracts.rewards.points', {
          minutes: Math.max(1, Math.round(reward.value / 60)),
        });
      case 'multiplier':
        return this.transloco.translate('contracts.rewards.multiplier', {
          value: reward.value.toFixed(1),
          minutes: Math.max(1, Math.round((reward.durationSeconds ?? 0) / 60)),
        });
      case 'golden_croquetas':
        return this.transloco.translate('contracts.rewards.golden', {
          value: reward.value,
        });
    }
  }

  /** Datos de skins para la tabla */
  getSkinsTableData(): SkinReportData[] {
    return SKINS.map((s) => {
      const unlocked = this.skinsService.isSkinUnlocked(s);
      let requirement = '-';
      if (s.unlockRequirement) {
        switch (s.unlockRequirement.type) {
          case 'level':
            requirement = `${this.transloco.translate('report.level')} ${s.unlockRequirement.value}`;
            break;
          case 'croquetas':
            requirement = `${this.pointsService.formatPoints(s.unlockRequirement.value)} ¢`;
            break;
          case 'exp':
            requirement = `${this.pointsService.formatPoints(s.unlockRequirement.value)} XP`;
            break;
          case 'achievement':
            requirement = this.transloco.translate('report.achievementReq');
            break;
          default:
            requirement = this.transloco.translate('report.free');
        }
      }
      return {
        id: s.id,
        name: this.transloco.translate(s.name),
        rarity: this.transloco.translate(s.rarity ?? 'skins.rarity.common'),
        unlocked,
        requirement,
      };
    });
  }

  /** Datos de ROI de productores para gráfico de barras */
  getProducerROIData(): ChartItem[] {
    const result: ChartItem[] = [];
    for (const p of PRODUCERS) {
      const q = Number(this.optionsService.getGameItem('producer_' + p.id + '_quantity') || 0) || 0;
      if (q <= 0) continue;
      const base = p.pointsBase * q;
      const seq = (q * (q - 1)) / 2;
      const bonus = p.pointsSum * seq;
      const cps = base + bonus;
      const roi = p.priceBase > 0 ? Math.round((cps / p.priceBase) * 10000) / 10 : 0;
      result.push({
        name: this.transloco.translate(p.name),
        value: roi,
      });
    }
    return result;
  }

  /** Donut de skins desbloqueadas por rareza */
  getSkinUnlockByRarityDonut(): DonutChartItem[] {
    const rarityOrder = [
      'skins.rarity.common',
      'skins.rarity.rare',
      'skins.rarity.epic',
      'skins.rarity.legendary',
      'skins.rarity.mythic',
    ];
    const map = new Map<string, { unlocked: number; total: number }>();
    for (const skin of SKINS) {
      const key = skin.rarity ?? 'skins.rarity.common';
      const entry = map.get(key) ?? { unlocked: 0, total: 0 };
      entry.total++;
      if (this.skinsService.isSkinUnlocked(skin)) entry.unlocked++;
      map.set(key, entry);
    }
    return rarityOrder
      .filter((r) => map.has(r))
      .map((r) => {
        const e = map.get(r)!;
        const pct = e.total > 0 ? Math.round((e.unlocked / e.total) * 1000) / 10 : 0;
        return {
          name: `${this.transloco.translate(r)} (${e.unlocked}/${e.total})`,
          value: e.unlocked,
          percentage: pct,
        };
      });
  }

  getDebugInfo(): DebugInfoData {
    const lastSaveRaw = this.optionsService.getGameItem('last_save_time');
    const lastSave = lastSaveRaw ? new Date(Number(lastSaveRaw)).toLocaleString() : '-';
    const { keyCount, sizeKb } = this.getStorageStats();

    return {
      debugEnabled: this.debugService.isDebugMode,
      lastSaveTime: lastSave,
      storageKeys: keyCount,
      storageSizeKb: sizeKb,
      lang: this.transloco.getActiveLang(),
      gameItemsVersion: this.optionsService.gameItemsVersion(),
    };
  }

  private getUnlockedSkinsCount(): number {
    return SKINS.filter((s) => this.skinsService.isSkinUnlocked(s)).length;
  }

  private getBoughtUpgradesCount(): number {
    return UPGRADES.filter(
      (u) => this.optionsService.getGameItem('upgrade_' + u.id + '_bought') === 'true',
    ).length;
  }

  private getTotalProducersCount(): number {
    let total = 0;
    for (const p of PRODUCERS) {
      total += Number(this.optionsService.getGameItem('producer_' + p.id + '_quantity') || 0) || 0;
    }
    return total;
  }

  formatTime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  }

  formatNumber(num: number): string {
    return this.pointsService.formatPoints(num);
  }

  private getStorageStats(): { keyCount: number; sizeKb: number } {
    if (typeof localStorage === 'undefined') return { keyCount: 0, sizeKb: 0 };

    let keyCount = 0;
    let totalBytes = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(GAME_PREFIX)) continue;
      keyCount++;
      const value = localStorage.getItem(key) ?? '';
      totalBytes += key.length + value.length;
    }

    return {
      keyCount,
      sizeKb: Math.round((totalBytes / 1024) * 10) / 10,
    };
  }
}
