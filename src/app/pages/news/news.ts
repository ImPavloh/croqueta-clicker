import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsService } from '@services/news.service';
import { PlayerStats } from '@services/player-stats.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoModule } from '@jsverse/transloco';
import { distinctUntilChanged, map, switchMap } from 'rxjs';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, TranslocoModule],
  templateUrl: './news.html',
  styleUrl: './news.css',
})
/**
 * Componente de la página de noticias.
 * Muestra noticias aleatorias basadas en el nivel del jugador.
 */
export class News {
  private newsService = inject(NewsService);
  private playerStats = inject(PlayerStats);

  private newsLevel$ = this.playerStats.level$.pipe(
    map((playerLevel) => {
      if (playerLevel > 200) return 5;
      if (playerLevel > 100) return 4;
      if (playerLevel > 50) return 3;
      if (playerLevel > 30) return 2;
      return 1;
    }),
    distinctUntilChanged()
  );

  private news$ = this.newsLevel$.pipe(
    switchMap((level) => this.newsService.getNewsByLevel(level))
  );

  protected newsItems = toSignal(this.news$, { initialValue: [] });
  protected currentLevel = toSignal(this.newsLevel$, { initialValue: 1 });
}
