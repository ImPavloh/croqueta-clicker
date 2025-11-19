import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ShortNumberPipe } from '@pipes/short-number.pipe';
import { PlayerStats } from '@services/player-stats.service';
import { GoldenCroquetaService } from '@services/golden-croqueta.service';

type StatsVariant = 'mobile' | 'desktop' | 'auto';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule, ShortNumberPipe],
  templateUrl: './stats.html',
  styleUrl: './stats.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatsComponent {
  @Input() variant: StatsVariant = 'auto';

  private playerStats = inject(PlayerStats);
  protected goldenCroquetaService = inject(GoldenCroquetaService);

  // nivel y experiencia
  level = toSignal(this.playerStats.level$, { initialValue: 0 });
  currentExp = computed(() => this.playerStats.currentExp());
  expToNext = computed(() => this.playerStats.expToNext());

  expProgress = computed(() => {
    const cur = this.currentExp();
    const next = this.expToNext();
    return next > 0 ? (cur / next) * 100 : 0;
  });

  // progreso circular
  readonly radius = 58;
  readonly circumference = 2 * Math.PI * this.radius;
  private progress = computed(() => {
    const cur = this.currentExp();
    const next = this.expToNext();
    return next > 0 ? cur / next : 0;
  });
  strokeDashoffset = computed(() => this.circumference - this.progress() * this.circumference);

  // stats generales
  totalClicks = computed(() => this.playerStats.totalClicks());
  timePlaying = computed(() => this.playerStats.timePlaying());

  mode(): 'mobile' | 'desktop' {
    if (this.variant === 'mobile') return 'mobile';
    if (this.variant === 'desktop') return 'desktop';
    return typeof window !== 'undefined' && window.innerWidth <= 1344 ? 'mobile' : 'desktop';
  }

  formatTime(seconds: number): string {
    const years = Math.floor(seconds / 31536000);
    const weeks = Math.floor(seconds / 604800);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (years > 0) return `${years}y ${weeks % 52}w`;
    if (weeks > 0) return `${weeks}w ${days % 7}d`;
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  }
}
