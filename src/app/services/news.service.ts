import { Injectable } from '@angular/core';
import { NEWS_DATA, NewsItem } from '../data/news.data';

@Injectable({
  providedIn: 'root'
})
export class NewsService {

  constructor() { }

  /**
   * Obtiene las noticias para un nivel específico, ordenadas aleatoriamente.
   * @param level El nivel de noticias a filtrar.
   * @returns Un array de NewsItem ordenado aleatoriamente.
   */
  getNewsByLevel(level: number): NewsItem[] {
    const filtered = NEWS_DATA.filter(item => item.level === level);
    // Devolvemos una copia barajada para no mutar el array original
    return this.shuffleArray([...filtered]);
  }

  /**
   * Ordena un array aleatoriamente usando el algoritmo Fisher-Yates.
   * @param array El array a ordenar.
   * @returns El array ordenado aleatoriamente.
   */
  private shuffleArray(array: NewsItem[]): NewsItem[] {
    let currentIndex = array.length;
    let randomIndex;

    // Mientras queden elementos por barajar
    while (currentIndex !== 0) {
      // Elegir un elemento restante
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // Intercambiarlo con el elemento actual
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]
      ];
    }
    return array;
  }
}
