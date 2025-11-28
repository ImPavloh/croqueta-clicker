import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ACHIEVEMENTS } from '@data/achievements.data';
import { GAME_PREFIX } from '@app/config/constants';
import { AchievementModel } from '@models/achivement.model';

/**
 * Servicio para gestionar la lógica de los logros, incluyendo su estado de desbloqueo,
 * persistencia en el almacenamiento local y una cola para notificaciones.
 */
@Injectable({ providedIn: 'root' })
export class AchievementsService {
  /**
   * Subject que almacena el estado de los logros desbloqueados (ID -> boolean).
   * Es privado para controlar su emisión.
   */
  private unlockedMapSubject = new BehaviorSubject<Record<string, boolean>>({});
  //Observable público que permite a los componentes suscribirse a los cambios en los logros desbloqueados.
  readonly unlockedMap$: Observable<Record<string, boolean>> =
    this.unlockedMapSubject.asObservable();

  //Subject que gestiona una cola (FIFO) de logros recién desbloqueados para ser mostrados como notificaciones.
  private queueSubject = new BehaviorSubject<AchievementModel[]>([]);

  //Observable público de la cola de notificaciones de logros.
  readonly queue$: Observable<AchievementModel[]> = this.queueSubject.asObservable();

  constructor() {
    this.loadFromStorage();

    // Persistencia: guarda el estado en el almacenamiento local cada vez que cambia el mapa de logros.
    this.unlockedMap$.subscribe((map) => {
      this.saveToStorage();
    });
  }

  /**
   * Carga el estado de los logros desbloqueados desde el `localStorage`.
   * Maneja de forma segura los casos en que no hay datos o los datos son inválidos.
   */
  private loadFromStorage(): void {
    try {
      //No hay datos
      if (typeof localStorage === 'undefined') return;
      const raw = localStorage.getItem(GAME_PREFIX + 'achievements');
      // Datos inválidos
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, boolean>;
      this.unlockedMapSubject.next(parsed ?? {});
    } catch (e) {
      console.warn('No se pudo leer achievements desde localStorage', e);
    }
  }

  /**
   * Guarda el mapa actual de logros desbloqueados en el `localStorage`.
   */
  private saveToStorage(): void {
    try {
      if (typeof localStorage === 'undefined') return;
      const map = this.unlockedMapSubject.getValue();
      localStorage.setItem(GAME_PREFIX + 'achievements', JSON.stringify(map));
    } catch (e) {
      console.warn('No se pudo guardar achievements en localStorage', e);
    }
  }

  /**
   * Obtiene la definición de un logro por su ID.
   * @param id El identificador del logro.
   * @returns El objeto `Achievement` o `undefined` si no se encuentra.
   */
  getAchievementById(id: string): AchievementModel | undefined {
    return ACHIEVEMENTS.find((a) => a.id === id);
  }

  /**
   * Devuelve el valor síncrono actual del mapa de logros desbloqueados.
   * @returns Un record con el estado de los logros.
   */
  private unlockedMapSnapshot(): Record<string, boolean> {
    return this.unlockedMapSubject.getValue();
  }

  /**
   * Desbloquea un logro por su ID. Si el logro no estaba ya desbloqueado,
   * actualiza el estado, lo añade a la cola de notificaciones y comprueba si se desbloquean meta-logros.
   * @param id El identificador del logro a desbloquear.
   * @returns `true` si el logro se ha desbloqueado en esta llamada, `false` si ya estaba desbloqueado o no existe.
   */
  unlockAchievement(id: string): boolean {
    const currentMap = this.unlockedMapSnapshot();
    const already = !!currentMap[id];
    if (already) return false;

    const ach = this.getAchievementById(id);
    if (!ach) {
      console.warn(`Achievement ${id} no existe.`);
      return false;
    }

    // Actualiza el mapa de logros.
    const nextMap = { ...currentMap, [id]: true };
    this.unlockedMapSubject.next(nextMap);

    // Añade el logro a la cola de notificaciones si no estaba ya.
    const q = this.queueSubject.getValue();
    const exists = q.some((x) => x.id === ach.id);
    if (!exists) {
      this.queueSubject.next([...q, ach]);
    }

    this.checkAchievements();
    return true;
  }

  /**
   * Comprueba y desbloquea logros que dependen de otros, como "primer logro" o "todos los logros".
   * Se llama internamente cada vez que se desbloquea un logro.
   */
  private checkAchievements(){
    if (this.getUnlockedCount() >= 1){
      this.unlockAchievement("primer_achievement")
    }
    if (this.getUnlockedCount() >= this.getTotalCount() -1){
      this.unlockAchievement("todos_achievements")
    }
  }

  /**
   * Devuelve un array con todos los logros disponibles, cada uno con una propiedad `unlocked` que indica su estado.
   * @returns Un array de logros con su estado de desbloqueo.
   */
  getAllWithState(): Array<AchievementModel & { unlocked: boolean }> {
    const map = this.unlockedMapSnapshot();
    return ACHIEVEMENTS.map((a) => ({ ...a, unlocked: !!map[a.id] }));
  }

  /**
   * Saca el siguiente logro de la cola de notificaciones (FIFO).
   * Utilizado por la UI para mostrar los pop-ups de logros.
   * @returns El logro que estaba al principio de la cola, o `undefined` si la cola está vacía.
   */
  consumeNext(): AchievementModel | undefined {
    const q = this.queueSubject.getValue();
    if (q.length === 0) return undefined;
    const [first, ...rest] = q;
    this.queueSubject.next(rest);
    return first;
  }

  /**
   * Reinicia todo el progreso de los logros, limpiando el estado y el almacenamiento local.
   */
  resetAll(): void {
    this.unlockedMapSubject.next({});
    this.queueSubject.next([]);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(GAME_PREFIX + 'achievements');
      }
    } catch {}
  }

  /**
   * Obtiene el número actual de logros desbloqueados.
   * @returns El total de logros desbloqueados.
   */
  getUnlockedCount(): number {
    return Object.values(this.unlockedMapSnapshot()).filter(Boolean).length;
  }
  /**
   * Obtiene el número total de logros definidos en el juego.
   * @returns El número total de logros.
   */
  getTotalCount(): number {
    return ACHIEVEMENTS.length;
  }

  /**
   * Desbloquea todos los logros. Útil para depuración.
   */
  public unlockAllAchievements(): void {
    ACHIEVEMENTS.forEach((ach) => {
      this.unlockAchievement(ach.id);
    });
  }
}
