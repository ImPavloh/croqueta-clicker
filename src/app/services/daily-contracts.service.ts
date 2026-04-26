import { Injectable, inject, signal, computed, effect, Injector, OnDestroy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import Decimal from 'break_infinity.js';
import { OptionsService } from './options.service';
import { PlayerStats } from './player-stats.service';
import { PointsService } from './points.service';
import { PrestigeService } from './prestige.service';
import { AchievementsService } from './achievements.service';
import { SupabaseService } from './supabase.service';
import { UPGRADES } from '@data/upgrade.data';
import { DAILY_CONTRACT_DEFINITIONS } from '@data/daily-contracts.data';
import {
  ActiveDailyContract,
  DailyContractBonusState,
  DailyContractDefinition,
  DailyContractGenerationContext,
  DailyContractMetric,
  DailyContractsMetrics,
  DailyContractsObservedState,
  DailyContractsAggregateStats,
  DailyContractsState,
  DailyContractReward,
} from '@models/daily-contract.model';

@Injectable({
  providedIn: 'root',
})
export class DailyContractsService implements OnDestroy {
  private optionsService = inject(OptionsService);
  private playerStats = inject(PlayerStats);
  private injector = inject(Injector);
  private level = toSignal(this.playerStats.level$, {
    initialValue: this.playerStats._level.value,
  });

  private readonly storageKey = 'dailyContractsState';

  private _state = signal<DailyContractsState>(this.createStateForToday());
  private _now = signal<number>(Date.now());

  private remoteSyncTimerId?: ReturnType<typeof setTimeout>;
  private resetTimerId?: ReturnType<typeof setInterval>;
  private saveTimerId?: ReturnType<typeof setTimeout>;
  private onlineListener?: () => void;
  private authSubscription?: { unsubscribe(): void };
  private isHydratingRemote = false;

  private get pointsService(): PointsService {
    return this.injector.get(PointsService);
  }

  private get prestigeService(): PrestigeService {
    return this.injector.get(PrestigeService);
  }

  private get achievementsService(): AchievementsService {
    return this.injector.get(AchievementsService);
  }

  private get supabaseService(): SupabaseService {
    return this.injector.get(SupabaseService);
  }

  readonly contracts = computed(() => this._state().contracts);
  readonly totalCount = computed(() => this.contracts().length);
  readonly completedCount = computed(
    () => this.contracts().filter((contract) => contract.progress >= contract.target).length,
  );
  readonly claimedCount = computed(
    () => this.contracts().filter((contract) => contract.claimed).length,
  );
  readonly claimableCount = computed(
    () =>
      this.contracts().filter(
        (contract) => contract.progress >= contract.target && !contract.claimed,
      ).length,
  );
  readonly completionRatio = computed(() => {
    const total = this.totalCount();
    if (total === 0) return 0;
    return Math.round((this.claimedCount() / total) * 100);
  });
  readonly resetTimeLabel = computed(() => this.formatDuration(this.getMsUntilReset(this._now())));
  readonly bonusReward = computed(() => this._state().bonus.reward);
  readonly bonusClaimed = computed(() => this._state().bonus.claimed);
  readonly bonusAvailable = computed(() => this.isBonusAvailable(this._state()));
  readonly currentStreak = computed(() => this._state().stats.currentStreak);
  readonly bestStreak = computed(() => this._state().stats.bestStreak);
  readonly weeklyCompletedDays = computed(() => this._state().stats.weeklyCompletedDays);
  readonly lifetimeClaimedContracts = computed(() => this._state().stats.lifetimeClaimedContracts);
  readonly lifetimeCompletedDays = computed(() => this._state().stats.lifetimeCompletedDays);
  readonly lifetimeBonusClaims = computed(() => this._state().stats.lifetimeBonusClaims);

  constructor() {
    const loadedState = this.loadState();
    if (loadedState && loadedState.dateKey === this.getTodayKey()) {
      this._state.set(this.normalizeState(loadedState));
    } else {
      this._state.set(this.createStateForToday(loadedState));
      this.persistState();
    }

    this.setupObservers();
    this.setupRemoteSync();
    this.evaluateAchievements();

    if (typeof window !== 'undefined') {
      this.resetTimerId = setInterval(() => {
        this._now.set(Date.now());
        this.rotateIfNeeded();
      }, 1000);
    }
  }

  trackProducerPurchase(amount: number): void {
    this.incrementMetric('producer_purchases', amount);
  }

  trackUpgradePurchase(): void {
    this.incrementMetric('upgrade_purchases', 1);
  }

  trackEventCapture(): void {
    this.incrementMetric('event_captures', 1);
  }

  trackPrestige(): void {
    this.incrementMetric('prestiges', 1);
    this.updateObserved({ level: this.playerStats._level.value });
  }

  getSnapshot(): DailyContractsState {
    this.rotateIfNeeded();

    const state = this._state();
    return {
      dateKey: state.dateKey,
      contracts: state.contracts.map((contract) => ({
        ...contract,
        reward: { ...contract.reward },
      })),
      metrics: { ...state.metrics },
      lastObserved: { ...state.lastObserved },
      bonus: {
        claimed: state.bonus.claimed,
        reward: state.bonus.reward ? { ...state.bonus.reward } : null,
      },
      stats: { ...state.stats },
    };
  }

  claimContract(contractId: string): boolean {
    this.rotateIfNeeded();

    const contract = this.contracts().find((item) => item.id === contractId);
    if (!contract || contract.claimed || contract.progress < contract.target) {
      return false;
    }

    this.applyReward(contract.reward);

    this._state.update((state) => ({
      ...state,
      stats: {
        ...state.stats,
        lifetimeClaimedContracts: state.stats.lifetimeClaimedContracts + 1,
      },
      contracts: state.contracts.map((item) =>
        item.id === contractId ? { ...item, claimed: true } : item,
      ),
    }));

    this.applyCompletionMilestones();
    this.evaluateAchievements();
    this.persistState();
    return true;
  }

  claimBonus(): boolean {
    this.rotateIfNeeded();

    const state = this._state();
    if (!this.isBonusAvailable(state) || state.bonus.claimed || !state.bonus.reward) {
      return false;
    }

    this.applyReward(state.bonus.reward);

    this._state.update((current) => ({
      ...current,
      bonus: {
        ...current.bonus,
        claimed: true,
      },
      stats: {
        ...current.stats,
        lifetimeBonusClaims: current.stats.lifetimeBonusClaims + 1,
      },
    }));

    this.evaluateAchievements();
    this.persistState();
    return true;
  }

  ngOnDestroy(): void {
    if (this.resetTimerId) {
      clearInterval(this.resetTimerId);
    }
    if (this.remoteSyncTimerId) {
      clearTimeout(this.remoteSyncTimerId);
    }
    if (this.saveTimerId) {
      clearTimeout(this.saveTimerId);
    }
    if (this.onlineListener) {
      window.removeEventListener('online', this.onlineListener);
    }
    this.authSubscription?.unsubscribe();
    this.persistState();
  }

  private setupObservers(): void {
    effect(() => {
      const totalClicks = this.playerStats.totalClicks();
      const previousClicks = this._state().lastObserved.totalClicks;

      if (totalClicks < previousClicks) {
        this.updateObserved({ totalClicks });
        return;
      }

      const delta = totalClicks - previousClicks;
      if (delta > 0) {
        this.incrementMetric('manual_clicks', delta, { totalClicks });
      }
    });

    effect(() => {
      const currentLevel = this.level();
      const previousLevel = this._state().lastObserved.level;

      if (currentLevel < previousLevel) {
        this.updateObserved({ level: currentLevel });
        return;
      }

      const delta = currentLevel - previousLevel;
      if (delta > 0) {
        this.incrementMetric('levels_gained', delta, { level: currentLevel });
      }
    });
  }

  private incrementMetric(
    metric: DailyContractMetric,
    amount: number,
    observedPatch?: Partial<DailyContractsObservedState>,
  ): void {
    if (amount <= 0) {
      if (observedPatch) {
        this.updateObserved(observedPatch);
      }
      return;
    }

    this.rotateIfNeeded();

    this._state.update((state) => {
      const nextMetrics: DailyContractsMetrics = {
        ...state.metrics,
        [metric]: state.metrics[metric] + amount,
      };

      return {
        ...state,
        metrics: nextMetrics,
        lastObserved: {
          ...state.lastObserved,
          ...observedPatch,
        },
        contracts: state.contracts.map((contract) => {
          if (contract.metric !== metric) {
            return contract;
          }

          return {
            ...contract,
            progress: Math.min(contract.target, contract.progress + amount),
          };
        }),
      };
    });

    this.applyCompletionMilestones();
    this.scheduleSave();
  }

  private updateObserved(patch: Partial<DailyContractsObservedState>): void {
    this.rotateIfNeeded();

    this._state.update((state) => ({
      ...state,
      lastObserved: {
        ...state.lastObserved,
        ...patch,
      },
    }));

    this.scheduleSave();
  }

  private setupRemoteSync(): void {
    try {
      const authState = this.supabaseService
        .getClient()
        .auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            void this.hydrateFromRemote();
          }
        });
      this.authSubscription = authState.data.subscription;
    } catch {}

    if (typeof window !== 'undefined') {
      this.onlineListener = () => {
        void this.hydrateFromRemote();
      };
      window.addEventListener('online', this.onlineListener);
    }

    void this.hydrateFromRemote();
  }

  private async hydrateFromRemote(): Promise<void> {
    if (this.isHydratingRemote) {
      return;
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return;
    }

    this.isHydratingRemote = true;
    try {
      const remote = await this.supabaseService.getDailyContractsState();
      if (remote.data) {
        const merged = this.mergeStates(this._state(), remote.data);
        this._state.set(this.normalizeState(merged));
        this.rotateIfNeeded();
        this.evaluateAchievements();
        this.persistState(false);
      }

      await this.pushRemoteState();
    } finally {
      this.isHydratingRemote = false;
    }
  }

  private mergeStates(
    localState: DailyContractsState,
    remoteState: DailyContractsState,
  ): DailyContractsState {
    const local = this.normalizeState(localState);
    const remote = this.normalizeState(remoteState);
    const dateComparison = this.compareDateKeys(local.dateKey, remote.dateKey);

    if (dateComparison !== 0) {
      const newer = dateComparison > 0 ? local : remote;
      const older = dateComparison > 0 ? remote : local;
      return {
        ...newer,
        stats: this.mergeAggregateStats(newer.stats, older.stats),
      };
    }

    return {
      ...local,
      metrics: {
        manual_clicks: Math.max(local.metrics.manual_clicks, remote.metrics.manual_clicks),
        levels_gained: Math.max(local.metrics.levels_gained, remote.metrics.levels_gained),
        producer_purchases: Math.max(
          local.metrics.producer_purchases,
          remote.metrics.producer_purchases,
        ),
        upgrade_purchases: Math.max(
          local.metrics.upgrade_purchases,
          remote.metrics.upgrade_purchases,
        ),
        event_captures: Math.max(local.metrics.event_captures, remote.metrics.event_captures),
        prestiges: Math.max(local.metrics.prestiges, remote.metrics.prestiges),
      },
      lastObserved: {
        totalClicks: Math.max(local.lastObserved.totalClicks, remote.lastObserved.totalClicks),
        level: Math.max(local.lastObserved.level, remote.lastObserved.level),
      },
      contracts: local.contracts.map((contract) => {
        const remoteContract = remote.contracts.find(
          (item) => item.id === contract.id || item.definitionId === contract.definitionId,
        );

        if (!remoteContract) {
          return contract;
        }

        return {
          ...contract,
          progress: Math.max(contract.progress, remoteContract.progress),
          claimed: contract.claimed || remoteContract.claimed,
        };
      }),
      bonus: {
        reward: local.bonus.reward ?? remote.bonus.reward,
        claimed: local.bonus.claimed || remote.bonus.claimed,
      },
      stats: this.mergeAggregateStats(local.stats, remote.stats),
    };
  }

  private mergeAggregateStats(
    primary: DailyContractsAggregateStats,
    secondary: DailyContractsAggregateStats,
  ): DailyContractsAggregateStats {
    const currentWeekKey = this.getWeekKey(this.getTodayKey());
    const primaryLast = primary.lastCompletedDateKey;
    const secondaryLast = secondary.lastCompletedDateKey;
    const latestLast =
      this.compareNullableDateKeys(primaryLast, secondaryLast) >= 0 ? primaryLast : secondaryLast;
    const latestSource = latestLast === primaryLast ? primary : secondary;

    return {
      currentStreak: latestLast
        ? latestSource.currentStreak
        : Math.max(primary.currentStreak, secondary.currentStreak),
      bestStreak: Math.max(primary.bestStreak, secondary.bestStreak),
      weeklyCompletedDays:
        primary.weekKey === secondary.weekKey
          ? Math.max(primary.weeklyCompletedDays, secondary.weeklyCompletedDays)
          : primary.weekKey === currentWeekKey
            ? primary.weeklyCompletedDays
            : secondary.weekKey === currentWeekKey
              ? secondary.weeklyCompletedDays
              : 0,
      weekKey:
        primary.weekKey === currentWeekKey
          ? primary.weekKey
          : secondary.weekKey === currentWeekKey
            ? secondary.weekKey
            : currentWeekKey,
      lastCompletedDateKey: latestLast,
      lifetimeClaimedContracts: Math.max(
        primary.lifetimeClaimedContracts,
        secondary.lifetimeClaimedContracts,
      ),
      lifetimeCompletedDays: Math.max(
        primary.lifetimeCompletedDays,
        secondary.lifetimeCompletedDays,
      ),
      lifetimeBonusClaims: Math.max(primary.lifetimeBonusClaims, secondary.lifetimeBonusClaims),
    };
  }

  private queueRemoteSync(): void {
    if (this.isHydratingRemote || this.remoteSyncTimerId) {
      return;
    }

    this.remoteSyncTimerId = setTimeout(() => {
      this.remoteSyncTimerId = undefined;
      void this.pushRemoteState();
    }, 1500);
  }

  private async pushRemoteState(): Promise<void> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return;
    }

    await this.supabaseService.upsertDailyContractsState(this.getSnapshot());
  }

  private evaluateAchievements(): void {
    const stats = this._state().stats;

    if (stats.lifetimeClaimedContracts >= 1) {
      this.achievementsService.unlockAchievement('contracts_first_claim');
    }
    if (stats.lifetimeCompletedDays >= 1) {
      this.achievementsService.unlockAchievement('contracts_first_day');
    }
    if (stats.bestStreak >= 3) {
      this.achievementsService.unlockAchievement('contracts_streak_3');
    }
    if (stats.bestStreak >= 7) {
      this.achievementsService.unlockAchievement('contracts_streak_7');
    }
    if (stats.lifetimeBonusClaims >= 1) {
      this.achievementsService.unlockAchievement('contracts_bonus_claimed');
    }
  }

  private applyReward(reward: DailyContractReward): void {
    switch (reward.type) {
      case 'points': {
        const cpsReward = this.pointsService.getPointsPerSecond().times(reward.value);
        const clickFallback = this.pointsService
          .pointsPerClick()
          .times(Math.max(20, Math.round(reward.value / 15)));
        const bestReward = cpsReward.gt(clickFallback) ? cpsReward : clickFallback;
        const amount = bestReward.gt(100) ? bestReward.floor() : new Decimal(100);
        this.pointsService.addPoints(amount);
        break;
      }
      case 'multiplier':
        this.pointsService.addMultiplier(reward.value, (reward.durationSeconds ?? 600) * 1000);
        break;
      case 'golden_croquetas':
        this.prestigeService.grantGoldenCroquetas(reward.value);
        break;
    }
  }

  private rotateIfNeeded(): void {
    const todayKey = this.getTodayKey();
    if (this._state().dateKey === todayKey) {
      return;
    }

    this._state.set(this.createStateForToday(this._state()));
    this.persistState();
  }

  private createStateForToday(previousState?: DailyContractsState | null): DailyContractsState {
    const context = this.buildGenerationContext();
    const dateKey = this.getTodayKey();

    return {
      dateKey,
      contracts: this.generateContracts(context),
      metrics: this.createEmptyMetrics(),
      lastObserved: this.createObservedSnapshot(),
      bonus: this.createBonusState(context, dateKey),
      stats: this.buildCarriedStats(previousState, dateKey),
    };
  }

  private generateContracts(context: DailyContractGenerationContext): ActiveDailyContract[] {
    const eligibleDefinitions = DAILY_CONTRACT_DEFINITIONS.filter((definition) =>
      this.isDefinitionEligible(definition, context),
    );
    const targetCount = Math.min(3, eligibleDefinitions.length);
    const random = this.createSeededRandom(this.getTodayKey());
    const definitionsByMetric = new Map<DailyContractMetric, DailyContractDefinition[]>();

    for (const definition of eligibleDefinitions) {
      const bucket = definitionsByMetric.get(definition.metric) ?? [];
      bucket.push(definition);
      definitionsByMetric.set(definition.metric, bucket);
    }

    const selectedDefinitions: DailyContractDefinition[] = [];
    const availableMetrics = [...definitionsByMetric.keys()];

    while (selectedDefinitions.length < targetCount && availableMetrics.length > 0) {
      const metricIndex = Math.floor(random() * availableMetrics.length);
      const metric = availableMetrics.splice(metricIndex, 1)[0];
      const metricDefinitions = definitionsByMetric.get(metric) ?? [];
      const definitionIndex = Math.floor(random() * metricDefinitions.length);
      const [definition] = metricDefinitions.splice(definitionIndex, 1);

      if (definition) {
        selectedDefinitions.push(definition);
      }
    }

    const fallbackPool = [...definitionsByMetric.values()].flat();

    while (selectedDefinitions.length < targetCount && fallbackPool.length > 0) {
      const definitionIndex = Math.floor(random() * fallbackPool.length);
      const [definition] = fallbackPool.splice(definitionIndex, 1);

      if (definition) {
        selectedDefinitions.push(definition);
      }
    }

    return selectedDefinitions.map((definition) => this.createContract(definition, context));
  }

  private createContract(
    definition: DailyContractDefinition,
    context: DailyContractGenerationContext,
  ): ActiveDailyContract {
    return {
      id: `${this.getTodayKey()}:${definition.id}`,
      definitionId: definition.id,
      metric: definition.metric,
      icon: definition.icon,
      titleKey: definition.titleKey,
      descriptionKey: definition.descriptionKey,
      target: definition.target(context),
      progress: 0,
      reward: definition.reward(context),
      claimed: false,
    };
  }

  private isDefinitionEligible(
    definition: DailyContractDefinition,
    context: DailyContractGenerationContext,
  ): boolean {
    if (definition.minLevel !== undefined && context.level < definition.minLevel) {
      return false;
    }

    if (definition.maxLevel !== undefined && context.level > definition.maxLevel) {
      return false;
    }

    if (
      definition.minCroquetasPerSecond !== undefined &&
      context.croquetasPerSecond < definition.minCroquetasPerSecond
    ) {
      return false;
    }

    if (definition.requiresRemainingUpgrades && context.remainingUpgrades <= 0) {
      return false;
    }

    if (definition.requiresPrestigeReady && !context.canPrestige) {
      return false;
    }

    return true;
  }

  private buildGenerationContext(): DailyContractGenerationContext {
    const remainingUpgrades = UPGRADES.filter(
      (upgrade) => this.optionsService.getGameItem(`upgrade_${upgrade.id}_bought`) !== 'true',
    ).length;

    return {
      level: this.playerStats._level.value,
      prestigeLevel: this.prestigeService.prestigeLevel(),
      croquetasPerSecond: this.safeDecimalToNumber(this.pointsService.getPointsPerSecond()),
      remainingUpgrades,
      canPrestige: this.prestigeService.canPrestige(),
    };
  }

  private createEmptyMetrics(): DailyContractsMetrics {
    return {
      manual_clicks: 0,
      levels_gained: 0,
      producer_purchases: 0,
      upgrade_purchases: 0,
      event_captures: 0,
      prestiges: 0,
    };
  }

  private createObservedSnapshot(): DailyContractsObservedState {
    return {
      totalClicks: this.playerStats.totalClicks(),
      level: this.playerStats._level.value,
    };
  }

  private createBonusState(
    context: DailyContractGenerationContext,
    dateKey: string,
  ): DailyContractBonusState {
    return {
      reward: this.generateBonusReward(context, dateKey),
      claimed: false,
    };
  }

  private createEmptyStats(dateKey = this.getTodayKey()): DailyContractsAggregateStats {
    return {
      currentStreak: 0,
      bestStreak: 0,
      weeklyCompletedDays: 0,
      weekKey: this.getWeekKey(dateKey),
      lastCompletedDateKey: null,
      lifetimeClaimedContracts: 0,
      lifetimeCompletedDays: 0,
      lifetimeBonusClaims: 0,
    };
  }

  private buildCarriedStats(
    previousState: DailyContractsState | null | undefined,
    dateKey: string,
  ): DailyContractsAggregateStats {
    const base = {
      ...this.createEmptyStats(dateKey),
      ...(previousState?.stats ?? {}),
    };
    const currentWeekKey = this.getWeekKey(dateKey);
    const streakCanContinue =
      !!previousState &&
      this.areAllContractsCompleted(previousState) &&
      this.isPreviousDay(previousState.dateKey, dateKey);

    return {
      ...base,
      currentStreak: streakCanContinue ? base.currentStreak : 0,
      weeklyCompletedDays: base.weekKey === currentWeekKey ? base.weeklyCompletedDays : 0,
      weekKey: currentWeekKey,
    };
  }

  private applyCompletionMilestones(): void {
    const state = this._state();
    if (
      !this.areAllContractsCompleted(state) ||
      state.stats.lastCompletedDateKey === state.dateKey
    ) {
      return;
    }

    this._state.update((current) => {
      if (
        !this.areAllContractsCompleted(current) ||
        current.stats.lastCompletedDateKey === current.dateKey
      ) {
        return current;
      }

      const continuedStreak =
        !!current.stats.lastCompletedDateKey &&
        this.isPreviousDay(current.stats.lastCompletedDateKey, current.dateKey);
      const nextStreak = continuedStreak ? current.stats.currentStreak + 1 : 1;
      const currentWeekKey = this.getWeekKey(current.dateKey);

      return {
        ...current,
        stats: {
          ...current.stats,
          currentStreak: nextStreak,
          bestStreak: Math.max(current.stats.bestStreak, nextStreak),
          weeklyCompletedDays:
            current.stats.weekKey === currentWeekKey ? current.stats.weeklyCompletedDays + 1 : 1,
          weekKey: currentWeekKey,
          lastCompletedDateKey: current.dateKey,
          lifetimeCompletedDays: current.stats.lifetimeCompletedDays + 1,
        },
      };
    });

    this.evaluateAchievements();
  }

  private areAllContractsCompleted(state: DailyContractsState): boolean {
    return (
      state.contracts.length > 0 &&
      state.contracts.every((contract) => contract.progress >= contract.target)
    );
  }

  private isBonusAvailable(state: DailyContractsState): boolean {
    return this.areAllContractsCompleted(state) && !state.bonus.claimed;
  }

  private generateBonusReward(
    context: DailyContractGenerationContext,
    dateKey: string,
  ): DailyContractReward {
    const random = this.createSeededRandom(`${dateKey}:bonus`);

    if (context.canPrestige && random() > 0.82) {
      return {
        type: 'golden_croquetas',
        value: Math.max(1, Math.min(4, 1 + Math.floor(context.prestigeLevel / 4))),
      };
    }

    if (context.level >= 20 && random() > 0.4) {
      return {
        type: 'multiplier',
        value: Number((1.8 + random() * 1.4).toFixed(1)),
        durationSeconds: 900 + Math.round(random() * 600),
      };
    }

    return {
      type: 'points',
      value: Math.max(
        1200,
        Math.round((240 + random() * 240) * Math.max(1, context.prestigeLevel + 1)),
      ),
    };
  }

  private loadState(): DailyContractsState | null {
    const raw = this.optionsService.getGameItem(this.storageKey);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as DailyContractsState;
    } catch {
      return null;
    }
  }

  private normalizeState(state: DailyContractsState): DailyContractsState {
    return {
      dateKey: state.dateKey,
      contracts: Array.isArray(state.contracts) ? state.contracts : [],
      metrics: {
        ...this.createEmptyMetrics(),
        ...(state.metrics ?? {}),
      },
      lastObserved: {
        ...this.createObservedSnapshot(),
        ...(state.lastObserved ?? {}),
      },
      bonus: {
        ...this.createBonusState(this.buildGenerationContext(), state.dateKey),
        ...(state.bonus ?? {}),
      },
      stats: {
        ...this.createEmptyStats(state.dateKey),
        ...(state.stats ?? {}),
      },
    };
  }

  private scheduleSave(): void {
    if (this.saveTimerId) {
      return;
    }

    this.saveTimerId = setTimeout(() => {
      this.saveTimerId = undefined;
      this.persistState();
    }, 1500);
  }

  private persistState(syncRemote = true): void {
    if (this.saveTimerId) {
      clearTimeout(this.saveTimerId);
      this.saveTimerId = undefined;
    }

    this.optionsService.setGameItem(this.storageKey, JSON.stringify(this._state()));
    if (syncRemote) {
      this.queueRemoteSync();
    }
  }

  private getTodayKey(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getWeekKey(dateKey: string): string {
    const date = new Date(`${dateKey}T12:00:00`);
    const day = (date.getDay() + 6) % 7;
    date.setDate(date.getDate() - day);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const dayOfMonth = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${dayOfMonth}`;
  }

  private isPreviousDay(previousDateKey: string, currentDateKey: string): boolean {
    const previous = new Date(`${previousDateKey}T12:00:00`);
    const current = new Date(`${currentDateKey}T12:00:00`);
    return current.getTime() - previous.getTime() === 24 * 60 * 60 * 1000;
  }

  private compareDateKeys(left: string, right: string): number {
    if (left === right) {
      return 0;
    }

    return left > right ? 1 : -1;
  }

  private compareNullableDateKeys(left: string | null, right: string | null): number {
    if (left === right) {
      return 0;
    }
    if (!left) {
      return -1;
    }
    if (!right) {
      return 1;
    }

    return this.compareDateKeys(left, right);
  }

  private getMsUntilReset(nowMs: number): number {
    const now = new Date(nowMs);
    const nextReset = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
    return Math.max(0, nextReset.getTime() - nowMs);
  }

  private formatDuration(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  private createSeededRandom(seed: string): () => number {
    let value = 2166136261;

    for (let index = 0; index < seed.length; index++) {
      value ^= seed.charCodeAt(index);
      value = Math.imul(value, 16777619);
    }

    return () => {
      value += 0x6d2b79f5;
      let mixed = Math.imul(value ^ (value >>> 15), 1 | value);
      mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed);
      return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
    };
  }

  private safeDecimalToNumber(value: Decimal): number {
    try {
      const numberValue = value.toNumber();
      return Number.isFinite(numberValue) ? numberValue : Number.MAX_SAFE_INTEGER;
    } catch {
      return Number.MAX_SAFE_INTEGER;
    }
  }
}
