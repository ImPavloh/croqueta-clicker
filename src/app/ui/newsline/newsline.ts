import { PlayerStats } from '@services/player-stats.service';
import {
  Component,
  input,
  computed,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { NewsService } from '@services/news.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-newsline',
  standalone: true, // Componente independiente
  imports: [], // No se necesita CommonModule para @for
  templateUrl: './newsline.html', // Enlazamos un HTML externo
  styleUrl: './newsline.css', // Enlazamos un CSS externo
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsLine {
  constructor(
    private newsService: NewsService,
    private playerStats: PlayerStats,
    private cdr: ChangeDetectorRef
  ) {}

  // Seleccionar nivel de noticias a mostrar
  private level: number = 1;
  private levelSub?: Subscription;
  ngOnInit() {
    this.levelSub = this.playerStats.level$.subscribe((level) => {
      this.level = 1;
      if (level > 30) {
        this.level = 3;
      } else if (level > 15) {
        this.level = 2;
      }
      this.cdr.markForCheck();
    });
  }

  // Creamos un signal 'computed' para la cadena de texto
  // Se recalculará automáticamente SOLO si el signal 'level' cambia.
  private newsString = computed(() => {
    // Obtenemos las noticias aleatorias del servicio
    const shuffledNews = this.newsService.getNewsByLevel(this.level);

    if (shuffledNews.length === 0) {
      return 'No hay noticias disponibles para este nivel. ';
    }

    // Unimos todas las noticias en un solo string
    const separator = '  •  ';
    return shuffledNews.map((item) => item.news).join(separator) + separator;
  });

  // Creamos un array con dos copias del string para el @for
  // Esto es necesario para la animación de bucle infinito.
  protected displayItems = computed(() => [this.newsString(), this.newsString()]);
}
