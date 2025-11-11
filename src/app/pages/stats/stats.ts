import { Component, computed, inject } from '@angular/core';
import { PlayerStats } from '@services/player-stats.service';
import { StatCardComponent } from '@ui/stat-card/stat-card';
import { CommonModule } from '@angular/common';
import { AchievementList } from '@ui/achievement-list/achievement-list';
import { STATS } from '@data/stats.data';
import { toSignal } from '@angular/core/rxjs-interop';
import { CornerCard } from '@ui/corner-card/corner-card';

@Component({
  selector: 'app-stats',
  imports: [StatCardComponent, CommonModule, AchievementList, CornerCard],
  templateUrl: './stats.html',
  styleUrl: './stats.css',
})
export class Stats {
  private playerStats = inject(PlayerStats);

  level = toSignal(this.playerStats._level, { initialValue: 0 });

  stats = STATS;

  // Stats individuales
  clicksStat = STATS.find((s) => s.id === 'total_clicks')!;
  timeStat = STATS.find((s) => s.id === 'time_playing')!;

  // Circular progress bar - radio aumentado a 78
  circumference = 2 * Math.PI * 78; // radio = 78

  strokeDashoffset = computed(() => {
    const progress = this.getValue('expProgress');
    return this.circumference - progress * this.circumference;
  });

  // Exponer valores de experiencia
  currentExp = computed(() => this.playerStats.currentExp());
  expToNext = computed(() => this.playerStats.expToNext());

  // Computar valores reactivamente
  values = computed(() => {
    return {
      totalClicks: this.playerStats.totalClicks(),
      timePlaying: this.playerStats.timePlaying(),
      level: this.level(),
      expProgress:
        this.playerStats.expToNext() > 0
          ? this.playerStats.currentExp() / this.playerStats.expToNext()
          : 0,
    };
  });

  getValue(key: string): number {
    // Usar aserción de tipo
    const statsValues = this.values() as any;
    return statsValues[key] || 0;
  }
}
