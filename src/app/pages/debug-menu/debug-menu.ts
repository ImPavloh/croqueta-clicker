import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { GameService } from '../../services/game.service';
import { TranslocoModule } from '@jsverse/transloco';
import { Card } from '../../ui/card/card';
import { ButtonComponent } from '../../ui/button/button';
import { CommonModule } from '@angular/common';
import { InputComponent } from '@ui/input/input';
import { PointsService } from '../../services/points.service';
import { PlayerStats } from '../../services/player-stats.service';
import { ReportService } from '@services/report.service';
import { DailyContractsService } from '@services/daily-contracts.service';

@Component({
  selector: 'app-debug-menu',
  templateUrl: './debug-menu.html',
  styleUrl: './debug-menu.css',
  imports: [TranslocoModule, Card, ButtonComponent, CommonModule, InputComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DebugMenuComponent {
  private gameService = inject(GameService);
  private pointsService = inject(PointsService);
  private playerStats = inject(PlayerStats);
  private reportService = inject(ReportService);
  private dailyContracts = inject(DailyContractsService);

  readonly croquetas = signal(0);
  readonly exp = signal(0);
  readonly cps = signal(0);
  readonly cpc = signal(0);
  readonly resetArmed = signal(false);
  private readonly refreshNonce = signal(0);

  readonly summary = computed(() => {
    this.refreshNonce();
    this.pointsService.points();
    this.pointsService.pointsPerSecond();
    this.pointsService.pointsPerClick();
    this.playerStats.totalClicks();
    this.playerStats.currentExp();
    this.playerStats.expToNext();
    this.playerStats.timePlaying();
    this.dailyContracts.claimedCount();
    this.dailyContracts.claimableCount();
    this.dailyContracts.currentStreak();
    this.dailyContracts.bestStreak();
    return this.reportService.getGameSummary();
  });

  readonly overviewMetrics = computed(() => {
    const summary = this.summary();
    return [
      { labelKey: 'report.player.croquetas', value: summary.totalCroquetas },
      { labelKey: 'report.player.cps', value: summary.croquetasPerSecond },
      { labelKey: 'report.player.cpc', value: summary.croquetasPerClick },
      { labelKey: 'report.player.level', value: String(summary.level) },
      { labelKey: 'report.player.clicks', value: String(summary.totalClicks) },
      { labelKey: 'report.player.time', value: summary.timePlayingFormatted },
    ];
  });

  readonly progressionMetrics = computed(() => {
    const summary = this.summary();
    return [
      {
        labelKey: 'debug.expProgress',
        value: `${summary.currentExp} / ${summary.expToNext} (${summary.expProgress}%)`,
      },
      {
        labelKey: 'achievements.title',
        value: `${summary.achievementsUnlocked} / ${summary.achievementsTotal}`,
      },
      { labelKey: 'skins.title', value: `${summary.skinsUnlocked} / ${summary.skinsTotal}` },
      {
        labelKey: 'upgrades.title',
        value: `${summary.upgradesBought} / ${summary.upgradesTotal}`,
      },
      {
        labelKey: 'debug.contractsClaimed',
        value: `${this.dailyContracts.claimedCount()} / ${this.dailyContracts.totalCount()}`,
      },
      { labelKey: 'debug.currentStreak', value: String(this.dailyContracts.currentStreak()) },
      { labelKey: 'debug.bestStreak', value: String(this.dailyContracts.bestStreak()) },
      {
        labelKey: 'report.player.prestige',
        value: `${summary.prestigeLevel} (x${summary.prestigeMultiplier})`,
      },
      { labelKey: 'report.player.goldenCroquetas', value: String(summary.goldenCroquetas) },
    ];
  });

  constructor() {
    this.loadCurrentValues();
  }

  setCroquetasValue(value: unknown): void {
    this.croquetas.set(this.parseInput(value));
  }

  setExpValue(value: unknown): void {
    this.exp.set(this.parseInput(value));
  }

  setCpsValue(value: unknown): void {
    this.cps.set(this.parseInput(value));
  }

  setCpcValue(value: unknown): void {
    this.cpc.set(this.parseInput(value));
  }

  loadCurrentValues(): void {
    this.croquetas.set(this.toFiniteNumber(this.pointsService.points().toNumber()));
    this.exp.set(this.playerStats.currentExp());
    this.cps.set(this.toFiniteNumber(this.pointsService.pointsPerSecond().toNumber()));
    this.cpc.set(this.toFiniteNumber(this.pointsService.pointsPerClick().toNumber()));
    this.resetArmed.set(false);
    this.refresh();
  }

  setCroquetas(): void {
    this.pointsService.setPoints(this.croquetas());
    this.refresh();
  }

  setExp(): void {
    this.playerStats.setExp(this.exp());
    this.refresh();
  }

  setCps(): void {
    this.pointsService.setCps(this.cps());
    this.refresh();
  }

  setCpc(): void {
    this.pointsService.setPointsPerClick(this.cpc());
    this.refresh();
  }

  unlockAllSkins(): void {
    this.gameService.unlockAllSkins();
    this.refresh();
  }

  unlockAllAchievements(): void {
    this.gameService.unlockAllAchievements();
    this.refresh();
  }

  armReset(): void {
    this.resetArmed.set(true);
  }

  cancelReset(): void {
    this.resetArmed.set(false);
  }

  resetGame(): void {
    this.gameService.resetGame();
    this.loadCurrentValues();
  }

  private refresh(): void {
    this.refreshNonce.update((value) => value + 1);
  }

  private parseInput(value: unknown): number {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : 0;
    }

    if (typeof value === 'string') {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    }

    return 0;
  }

  private toFiniteNumber(value: number): number {
    return Number.isFinite(value) ? value : 0;
  }
}
