import { PlayerStats } from '@services/player-stats.service';
import {
  Component,
  ChangeDetectionStrategy,
  inject,
  computed,
} from '@angular/core';
import { NewsService } from '@services/news.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, map, switchMap } from 'rxjs';

@Component({
  selector: 'app-newsline',
  standalone: true,
  imports: [],
  templateUrl: './newsline.html',
  styleUrl: './newsline.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsLine {
  private newsService = inject(NewsService);
  private playerStats = inject(PlayerStats);

  // 1. Creamos un observable que emite el nivel de noticias (1, 2, o 3)
  private newsLevel$ = this.playerStats.level$.pipe(
    map((playerLevel) => {
      if (playerLevel > 30) return 3;
      if (playerLevel > 15) return 2;
      return 1;
    }),
    distinctUntilChanged() // Solo emitimos si el nivel de noticias cambia
  );

  // 2. Usamos switchMap para cambiar al nuevo observable de noticias cuando el nivel cambia
  private news$ = this.newsLevel$.pipe(
    switchMap((level) => this.newsService.getNewsByLevel(level))
  );

  // 3. Convertimos el resultado en una señal para el template
  private newsSignal = toSignal(this.news$, { initialValue: [] });

  // 4. Creamos una señal computada final que duplica el array para el efecto de bucle infinito
  protected displayItems = computed(() => {
    const items = this.newsSignal();
    return [...items, ...items];
  });
}
