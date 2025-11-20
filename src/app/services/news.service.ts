import { Injectable, inject } from '@angular/core';
import { NEWS_DATA } from '@data/news.data';
import { TranslocoService } from '@jsverse/transloco';
import { Observable, map, startWith } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NewsService {
  private transloco = inject(TranslocoService);

  /**
   * Obtiene las noticias para un nivel específico, traducidas y ordenadas aleatoriamente.
   * @param level El nivel de noticias a obtener.
   * @returns Un observable que emite un array de strings con las noticias.
   */
  getNewsByLevel(level: number): Observable<string[]> {
    return this.transloco.langChanges$.pipe(
      startWith(this.transloco.getActiveLang()),
      map((lang) => {
        const newsForLevel = NEWS_DATA[level];
        if (!newsForLevel) {
          return ['No hay noticias para este nivel.'];
        }
        const translatedNews = newsForLevel[lang] || newsForLevel['es']; // Fallback a 'es'
        return this.shuffleArray([...translatedNews]);
      })
    );
  }

  /**
   * Ordena un array aleatoriamente usando el algoritmo Fisher-Yates.
   * @param array El array a ordenar.
   * @returns El array ordenado aleatoriamente.
   */
  private shuffleArray(array: string[]): string[] {
    let currentIndex = array.length;
    let randomIndex;

    // Mientras queden elementos por barajar
    while (currentIndex !== 0) {
      // Elegir un elemento restante
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // Intercambiarlo con el elemento actual
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  }
}
