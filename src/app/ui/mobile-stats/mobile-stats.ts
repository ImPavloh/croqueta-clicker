import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerStats } from '@services/player-stats.service';
import { ShortNumberPipe } from '@pipes/short-number.pipe';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-mobile-stats',
  imports: [CommonModule, ShortNumberPipe],
  templateUrl: './mobile-stats.html',
  styleUrl: './mobile-stats.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileStats {
  playerStats = inject(PlayerStats);

  level = toSignal(this.playerStats.level$, { initialValue: 0 });
  currentExp = computed(() => this.playerStats.currentExp());
  expToNext = computed(() => this.playerStats.expToNext());

  expProgress = computed(() => {
    const current = this.currentExp();
    const needed = this.expToNext();
    return needed > 0 ? (current / needed) * 100 : 0;
  });

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  }
}
