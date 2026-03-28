import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  ChangeDetectionStrategy,
  DestroyRef,
} from '@angular/core';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Card } from '@ui/card/card';
import { ButtonComponent } from '@ui/button/button';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import type {
  GameSummary,
  ProducerReportData,
  UpgradeReportData,
  AchievementReportData,
  SkinReportData,
  EfficiencyData,
  DebugInfoData,
} from '@models/report.model';
import { ReportService } from '@services/report.service';
import { ReportPdfService } from '@services/report-pdf.service';
import { DebugService } from '@services/debug.service';
import { SupabaseService } from '@services/supabase.service';
import { BarChartComponent, BarChartItem } from '@ui/charts/bar-chart';
import { DonutChartComponent, DonutChartItem } from '@ui/charts/donut-chart';
import { ProgressBarsComponent, ProgressBarItem } from '@ui/charts/progress-bars';
import { ShortNumberPipe } from '@pipes/short-number.pipe';
import type { LeaderboardStats } from '@models/report.model';

/**
 * Página de informes y estadísticas avanzadas.
 * tablas, gráficos y exportación a PDF
 */
@Component({
  selector: 'app-report',
  imports: [
    Card,
    ButtonComponent,
    TranslocoModule,
    FormsModule,
    BarChartComponent,
    DonutChartComponent,
    ProgressBarsComponent,
    ShortNumberPipe,
  ],
  templateUrl: './report.html',
  styleUrl: './report.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Report implements OnInit {
  private reportService = inject(ReportService);
  private transloco = inject(TranslocoService);
  private pdfService = inject(ReportPdfService);
  private debugService = inject(DebugService);
  private supabase = inject(SupabaseService);
  private destroyRef = inject(DestroyRef);
  private shortNumber = new ShortNumberPipe();

  isDebug = toSignal(this.debugService.isDebugMode$, {
    initialValue: this.debugService.isDebugMode,
  });

  summary = signal<GameSummary | null>(null);
  producers = signal<ProducerReportData[]>([]);
  upgrades = signal<UpgradeReportData[]>([]);
  achievements = signal<AchievementReportData[]>([]);
  skins = signal<SkinReportData[]>([]);
  efficiency = signal<EfficiencyData | null>(null);
  debugInfo = signal<DebugInfoData | null>(null);

  producerBarData = signal<BarChartItem[]>([]);
  cpsDonutData = signal<DonutChartItem[]>([]);
  progressData = signal<ProgressBarItem[]>([]);
  upgradesByLevelData = signal<BarChartItem[]>([]);
  achievementStatusData = signal<DonutChartItem[]>([]);
  skinRarityData = signal<BarChartItem[]>([]);
  skinUnlockDonutData = signal<DonutChartItem[]>([]);
  producerROIData = signal<BarChartItem[]>([]);

  leaderboardStats = signal<LeaderboardStats | null>(null);
  leaderboardTop = signal<Array<{ username: string; score: number }>>([]);
  leaderboardBuckets = signal<BarChartItem[]>([]);
  leaderboardLoading = signal(false);

  playerRows = signal<Array<{ label: string; value: string }>>([]);
  debugRows = signal<Array<{ label: string; value: string }>>([]);
  multiplayerRows = signal<Array<{ label: string; value: string }>>([]);

  activeTab = signal<'player' | 'debug' | 'multiplayer'>('player');

  // FILTROS
  filterProducerHideEmpty = signal(false);
  filterUpgradeStatus = signal<'all' | 'bought' | 'locked'>('all');
  filterUpgradeSearch = signal('');
  filterAchievementStatus = signal<'all' | 'unlocked' | 'locked'>('all');
  filterSkinRarity = signal<string>('all');
  filterSkinStatus = signal<'all' | 'unlocked' | 'locked'>('all');

  // DATOS FILTRADOS
  filteredProducers = computed(() => {
    let data = this.producers();
    if (this.filterProducerHideEmpty()) {
      data = data.filter((p) => p.quantity > 0);
    }
    return data;
  });

  filteredUpgrades = computed(() => {
    let data = this.upgrades();
    const status = this.filterUpgradeStatus();
    if (status === 'bought') data = data.filter((u) => u.bought);
    else if (status === 'locked') data = data.filter((u) => !u.bought);
    const search = this.filterUpgradeSearch().toLowerCase().trim();
    if (search) {
      data = data.filter((u) => this.transloco.translate(u.name).toLowerCase().includes(search));
    }
    return data;
  });

  filteredAchievements = computed(() => {
    let data = this.achievements();
    const status = this.filterAchievementStatus();
    if (status === 'unlocked') data = data.filter((a) => a.unlocked);
    else if (status === 'locked') data = data.filter((a) => !a.unlocked);
    return data;
  });

  filteredSkins = computed(() => {
    let data = this.skins();
    const rarity = this.filterSkinRarity();
    if (rarity !== 'all') {
      data = data.filter((s) => s.rarity === rarity);
    }
    const status = this.filterSkinStatus();
    if (status === 'unlocked') data = data.filter((s) => s.unlocked);
    else if (status === 'locked') data = data.filter((s) => !s.unlocked);
    return data;
  });

  // Rarities disponibles (para el selector de filtro)
  skinRarities = computed(() => {
    const set = new Set(this.skins().map((s) => s.rarity));
    return Array.from(set);
  });

  ngOnInit() {
    this.transloco
      .selectTranslation()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.refreshData();
        this.refreshLeaderboardStats();
      });
  }

  refreshData() {
    const summary = this.reportService.getGameSummary();
    this.summary.set(summary);
    this.producers.set(this.reportService.getProducersData());
    this.upgrades.set(this.reportService.getUpgradesData());
    this.achievements.set(this.reportService.getAchievementsData());
    this.skins.set(this.reportService.getSkinsTableData());
    this.efficiency.set(this.reportService.getEfficiencyData());
    this.debugInfo.set(this.reportService.getDebugInfo());

    this.producerBarData.set(this.reportService.getProducerDistribution());
    this.cpsDonutData.set(this.reportService.getCpsDistribution());
    this.progressData.set(this.reportService.getProgressData());
    this.upgradesByLevelData.set(this.reportService.getUpgradeLevelDistribution());
    this.achievementStatusData.set(this.reportService.getAchievementStatusDistribution());
    this.skinRarityData.set(this.reportService.getSkinRarityDistribution());
    this.skinUnlockDonutData.set(this.reportService.getSkinUnlockByRarityDonut());
    this.producerROIData.set(this.reportService.getProducerROIData());

    this.playerRows.set(this.buildPlayerRows(summary));
    this.debugRows.set(this.buildDebugRows());
  }

  async refreshLeaderboardStats() {
    if (!this.isDebug()) return;

    this.leaderboardLoading.set(true);
    const stats = await this.supabase.getLeaderboardStats();
    if (!stats.error && stats.data) {
      this.leaderboardStats.set(stats.data);
      this.leaderboardBuckets.set(
        stats.data.buckets.map((b) => ({ name: b.label, value: b.count })),
      );
    }

    const top = await this.supabase.getTopScores(5);
    if (!top.error && top.data) {
      this.leaderboardTop.set(
        top.data.map((t) => ({
          username: t.username ?? (t.user_id ? t.user_id.slice(0, 6) : 'anon'),
          score: t.score,
        })),
      );
    }
    this.leaderboardLoading.set(false);
    this.multiplayerRows.set(this.buildMultiplayerRows());
  }

  setTab(tab: 'player' | 'debug' | 'multiplayer') {
    this.activeTab.set(tab);
    if (tab === 'multiplayer' && !this.leaderboardStats()) {
      this.refreshLeaderboardStats();
    }
  }

  formatNumber = (v: number): string => {
    return this.shortNumber.transform(v, 1);
  };

  /** Exportar a PDF con window.print */
  exportPdf() {
    const summary = this.summary();
    const eff = this.efficiency();
    const dbg = this.debugInfo();
    if (!summary || !eff) return;

    const producers = this.producers().map((p) => ({
      ...p,
      name: this.transloco.translate(p.name),
    }));
    const upgrades = this.upgrades().map((u) => ({
      ...u,
      name: this.transloco.translate(u.name),
    }));
    const achievements = this.achievements().map((a) => ({
      ...a,
      title: this.transloco.translate(a.title),
    }));

    this.pdfService.exportReport({
      summary,
      producers,
      upgrades,
      achievements,
      skins: this.skins(),
      efficiency: eff,
      upgradesByLevel: this.upgradesByLevelData(),
      achievementsStatus: this.achievementStatusData(),
      skinRarity: this.skinRarityData(),
      leaderboardStats: this.leaderboardStats(),
      leaderboardTop: this.leaderboardTop(),
      localeTitle: this.transloco.translate('report.pdfTitle'),
      labels: this.buildPdfLabels(),
      debugInfo: {
        playerRows: this.playerRows().map((r) => [r.label, r.value]),
        debugRows: this.debugRows().map((r) => [r.label, r.value]),
        multiplayerRows: this.multiplayerRows().map((r) => [r.label, r.value]),
      },
    });
  }

  private buildPlayerRows(summary: GameSummary): Array<{ label: string; value: string }> {
    return [
      { label: this.transloco.translate('report.player.level'), value: String(summary.level) },
      {
        label: this.transloco.translate('report.player.exp'),
        value: `${summary.currentExp} / ${summary.expToNext}`,
      },
      {
        label: this.transloco.translate('report.player.expProgress'),
        value: `${summary.expProgress}%`,
      },
      {
        label: this.transloco.translate('report.player.clicks'),
        value: this.shortNumber.transform(summary.totalClicks, 1),
      },
      { label: this.transloco.translate('report.player.croquetas'), value: summary.totalCroquetas },
      { label: this.transloco.translate('report.player.cps'), value: summary.croquetasPerSecond },
      { label: this.transloco.translate('report.player.cpc'), value: summary.croquetasPerClick },
      {
        label: this.transloco.translate('report.player.time'),
        value: summary.timePlayingFormatted,
      },
      {
        label: this.transloco.translate('report.player.multiplier'),
        value: `x${summary.multiplier}`,
      },
      {
        label: this.transloco.translate('report.player.prestige'),
        value: String(summary.prestigeLevel),
      },
      {
        label: this.transloco.translate('report.player.goldenCroquetas'),
        value: String(summary.goldenCroquetas),
      },
    ];
  }

  private buildDebugRows(): Array<{ label: string; value: string }> {
    const dbg = this.debugInfo();
    if (!dbg) return [];

    return [
      {
        label: this.transloco.translate('report.debug.mode'),
        value: dbg.debugEnabled
          ? this.transloco.translate('report.debug.enabled')
          : this.transloco.translate('report.debug.disabled'),
      },
      { label: this.transloco.translate('report.debug.lang'), value: dbg.lang },
      {
        label: this.transloco.translate('report.debug.storageKeys'),
        value: String(dbg.storageKeys),
      },
      {
        label: this.transloco.translate('report.debug.storageSize'),
        value: `${dbg.storageSizeKb} KB`,
      },
      { label: this.transloco.translate('report.debug.lastSave'), value: dbg.lastSaveTime },
      {
        label: this.transloco.translate('report.debug.itemsVersion'),
        value: String(dbg.gameItemsVersion),
      },
    ];
  }

  private buildMultiplayerRows(): Array<{ label: string; value: string }> {
    const stats = this.leaderboardStats();
    if (!stats) return [];

    return [
      {
        label: this.transloco.translate('report.multiplayer.players'),
        value: String(stats.totalPlayers),
      },
      { label: this.transloco.translate('report.multiplayer.avg'), value: String(stats.avgLevel) },
      { label: this.transloco.translate('report.multiplayer.max'), value: String(stats.maxLevel) },
      { label: this.transloco.translate('report.multiplayer.min'), value: String(stats.minLevel) },
      {
        label: this.transloco.translate('report.multiplayer.lastUpdate'),
        value: stats.lastUpdated ?? '-',
      },
    ];
  }

  private buildPdfLabels(): Record<string, string> {
    const t = (key: string) => this.transloco.translate(key);
    return {
      summaryTitle: t('report.generalSummary'),
      efficiencyTitle: t('report.efficiencyTitle'),
      producersTitle: t('report.producersTable'),
      upgradesTitle: t('report.upgradesTable'),
      achievementsTitle: t('report.achievementsTable'),
      skinsTitle: t('report.skinsTable'),
      upgradeDistributionTitle: t('report.upgradeLevelDistribution'),
      achievementStatusTitle: t('report.achievementStatus'),
      skinRarityTitle: t('report.skinRarityDistribution'),
      leaderboardTitle: t('report.leaderboardStatsTitle'),
      leaderboardDistributionTitle: t('report.lbDistribution'),
      leaderboardTopTitle: t('report.lbTop'),
      playerTitle: t('report.tabPlayer'),
      debugTitle: t('report.tabDebug'),
      multiplayerTitle: t('report.tabMultiplayer'),
      metricLabel: t('report.metric'),
      valueLabel: t('report.value'),
      producerNameLabel: t('report.producerName'),
      quantityLabel: t('report.quantity'),
      cpsLabel: t('report.cpsContribution'),
      percentLabel: '%',
      upgradeNameLabel: t('report.upgradeName'),
      clickBonusLabel: t('report.clickBonus'),
      requiredLevelLabel: t('report.requiredLevel'),
      statusLabel: t('report.status'),
      achievementLabel: t('report.achievements'),
      stateLabel: t('report.status'),
      userLabel: t('report.lbUser'),
      levelLabel: t('report.level'),
      timeLabel: t('report.timePlaying'),
      multiplierLabel: t('report.multiplier'),
      producersLabel: t('report.totalProducers'),
      clicksPerMinuteLabel: t('report.clicksPerMinute'),
      croquetasPerMinuteLabel: t('report.croquetasPerMinute'),
      avgCpsPerProducerLabel: t('report.avgCpsPerProducer'),
      topProducerLabel: t('report.topProducer'),
      stateBoughtLabel: t('report.stateBought'),
      stateLockedLabel: t('report.stateLocked'),
      stateUnlockedLabel: t('report.stateUnlocked'),
      skinNameLabel: t('report.skinName'),
      rarityLabel: t('report.rarityLabel'),
      requirementLabel: t('report.requirementLabel'),
      upgradeEfficiencyLabel: t('report.upgradeEfficiency'),
      skinsCompletionLabel: t('report.skinsCompletion'),
      totalUpgradeCostLabel: t('report.totalUpgradeCost'),
    };
  }
}
