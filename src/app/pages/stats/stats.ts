import { Component, computed } from '@angular/core';
import { PlayerStats } from '@services/player-stats.service';
import { StatCardComponent, StatCardConfig } from '@ui/stat-card/stat-card';
import { CommonModule } from '@angular/common';
import { AchievementList } from '@ui/achievement-list/achievement-list';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-stats',
  imports: [StatCardComponent, CommonModule, AchievementList],
  templateUrl: './stats.html',
  styleUrl: './stats.css',
})
export class Stats {
  constructor(public playerStats: PlayerStats) {}

  private levelSub?: Subscription;
  private level: number = 0;

  ngOnInit() {
    this.levelSub = this.playerStats.level$.subscribe((level) => {
      this.level = level;
    });
  }

  ngOnDestroy() {
    this.levelSub?.unsubscribe();
  }

  // Usar computed para que se actualice automáticamente
  totalClicksView = computed<StatCardConfig>(() => ({
    title: 'Clicks totales',
    value: this.playerStats.totalClicks(),
    icon: 'person',
    format: 'number',
  }));

  totalTimePlaying = computed<StatCardConfig>(() => ({
    title: 'Tiempo jugado',
    value: this.playerStats.timePlaying(),
    icon: 'reloj',
    format: 'time',
  }));

  levelCurrent = computed<StatCardConfig>(() => ({
    title: 'Nivel: ',
    value: this.level,
    icon: 'level',
    format: 'number',
  }));

  expNecessary = computed<StatCardConfig>(() => ({
    title: 'Próximo nivel: ',
    value: this.playerStats.currentExp() / this.playerStats.expToNext(),
    icon: 'level',
    format: 'percentage',
  }));
}
