import { 
  Component, 
  input, // Nueva función para inputs
  computed, // Para estado derivado
  inject, // Para inyección de dependencias
  ChangeDetectionStrategy 
} from '@angular/core';
import { NewsService } from '../../services/news.service';

@Component({
  selector: 'app-newsline',
  standalone: true, // Componente independiente
  imports: [], // No se necesita CommonModule para @for
  templateUrl: './newsline.html', // Enlazamos un HTML externo
  styleUrl: './newsline.css', // Enlazamos un CSS externo
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewsLine {

  // Inyectamos el servicio usando la nueva función inject()
  private newsService = inject(NewsService);
  
  // Definimos el input
  level = input<number>(1);

  // Creamos un signal 'computed' para la cadena de texto
  // Se recalculará automáticamente SOLO si el signal 'level' cambia.
  private newsString = computed(() => {
    // Obtenemos las noticias aleatorias del servicio
    const shuffledNews = this.newsService.getNewsByLevel(this.level());
    
    if (shuffledNews.length === 0) {
      return 'No hay noticias disponibles para este nivel. ';
    }

    // Unimos todas las noticias en un solo string
    const separator = '  •  ';
    return shuffledNews.map(item => item.news).join(separator) + separator;
  });

  // Creamos un array con dos copias del string para el @for
  // Esto es necesario para la animación de bucle infinito.
  protected displayItems = computed(() => [
    this.newsString(), 
    this.newsString()
  ]);
  
}
