import { PlayerStats } from '@services/player-stats.service';
import {
  Component,
  computed,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  effect,
  inject,
} from '@angular/core';
import { NewsService } from '@services/news.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-newsline',
  standalone: true, // Componente independiente
  imports: [], // No se necesita CommonModule para @for
  templateUrl: './newsline.html', // Enlazamos un HTML externo
  styleUrl: './newsline.css', // Enlazamos un CSS externo
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsLine {
  private newsService = inject(NewsService);
  private playerStats = inject(PlayerStats);
  private cdr = inject(ChangeDetectorRef);

  // Seleccionar nivel de noticias a mostrar
  private level: number = 1;

  constructor() {
    const playerLevel = toSignal(this.playerStats.level$, { initialValue: 1 });

    effect(() => {
      const currentLevel = playerLevel();
      this.level = 1;
      if (currentLevel > 30) {
        this.level = 3;
      } else if (currentLevel > 15) {
        this.level = 2;
      }
      this.cdr.markForCheck();
    });
  }

  // Obtenemos las noticias como array
  protected displayItems = computed(() => {
    const shuffledNews = this.newsService.getNewsByLevel(this.level);

    if (shuffledNews.length === 0) {
      return ['No hay noticias disponibles para este nivel.'];
    }

    const newsArray = shuffledNews.map((item) => item.news);
    // Duplicamos el array para el loop infinito
    return [...newsArray, ...newsArray];
  });
}
