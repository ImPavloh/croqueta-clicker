import { Component, computed, inject, signal, effect } from '@angular/core';
import { PlayerStats } from '@services/player-stats.service';
import { StatCardComponent } from '@ui/stat-card/stat-card';
import { Tooltip } from '@ui/tooltip/tooltip';
import { CommonModule } from '@angular/common';
import { AchievementList } from '@ui/achievement-list/achievement-list';
import { STATS } from '@data/stats.data';
import { toSignal } from '@angular/core/rxjs-interop';
import { CornerCard } from '@ui/corner-card/corner-card';
import { ShortNumberPipe } from '@pipes/short-number.pipe';

@Component({
  selector: 'app-stats',
  imports: [StatCardComponent, CommonModule, AchievementList, CornerCard, ShortNumberPipe, Tooltip],
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
  shouldTransition = signal(true);

  private previousProgress = 0;

  private expProgress = computed(() => {
    const current = this.playerStats.currentExp();
    const next = this.playerStats.expToNext();
    return next > 0 ? current / next : 0;
  });

  strokeDashoffset = computed(() => {
    const progress = this.expProgress();
    return this.circumference - progress * this.circumference;
  });

  // Exponer valores de experiencia
  currentExp = computed(() => this.playerStats.currentExp());
  expToNext = computed(() => this.playerStats.expToNext());

  constructor() {
    effect(() => {
      const currentProgress = this.expProgress();

      if (currentProgress < this.previousProgress - 0.5) {
        this.shouldTransition.set(false);

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            this.shouldTransition.set(true);
          });
        });
      }

      this.previousProgress = currentProgress;
    });
  }

  // Computar valores reactivamente
  values = computed(() => {
    return {
      totalClicks: this.playerStats.totalClicks(),
      timePlaying: this.playerStats.timePlaying(),
      level: this.level(),
    };
  });

  getValue(key: string): number {
    // Usar aserción de tipo
    const statsValues = this.values() as any;
    return statsValues[key] || 0;
  }
}
