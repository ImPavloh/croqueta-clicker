import { PlayerStats } from '@services/player-stats.service';
import { ModalService } from '@services/modal.service';
import { AudioService } from '@services/audio.service';
import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
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
  private modalService = inject(ModalService);
  private audioService = inject(AudioService);

  // Creamos un observable que emite el nivel de noticias basado en el nivel del jugador
  private newsLevel$ = this.playerStats.level$.pipe(
    map((playerLevel) => {
      if (playerLevel > 200) return 5;
      if (playerLevel > 100) return 4;
      if (playerLevel > 50) return 3;
      if (playerLevel > 30) return 2;
      return 1;
    }),
    distinctUntilChanged() // Solo emitimos si el nivel de noticias cambia
  );

  // Usamos switchMap para cambiar al nuevo observable de noticias cuando el nivel cambia
  private news$ = this.newsLevel$.pipe(
    switchMap((level) => this.newsService.getNewsByLevel(level))
  );

  // Convertimos el resultado en una señal para el template
  private newsSignal = toSignal(this.news$, { initialValue: [] });

  // Creamos una señal computada final que duplica el array para el efecto de bucle infinito
  protected displayItems = computed(() => {
    const items = this.newsSignal();
    return [...items, ...items];
  });

  openNewsModal() {
    this.modalService.openModal('news');
    this.audioService.playSfx('/assets/sfx/click02.mp3', 1);
  }
}
