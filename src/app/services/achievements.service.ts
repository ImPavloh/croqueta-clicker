import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ACHIEVEMENTS, Achievement } from '@data/achievements.data';
import { GAME_PREFIX } from '@app/config/constants';

@Injectable({ providedIn: 'root' })
export class AchievementsService {
  // BehaviorSubject que mantiene el mapa id -> boolean
  private unlockedMapSubject = new BehaviorSubject<Record<string, boolean>>({});
  readonly unlockedMap$: Observable<Record<string, boolean>> =
    this.unlockedMapSubject.asObservable();

  // BehaviorSubject que actúa como cola de logros a mostrar (FIFO)
  private queueSubject = new BehaviorSubject<Achievement[]>([]);
  readonly queue$: Observable<Achievement[]> = this.queueSubject.asObservable();

  constructor() {
    this.loadFromStorage();

    // persistencia: cuando cambia unlockedMapSubject guardamos
    this.unlockedMap$.subscribe((map) => {
      this.saveToStorage();
    });
  }

  private loadFromStorage(): void {
    try {
      if (typeof localStorage === 'undefined') return;
      const raw = localStorage.getItem(GAME_PREFIX + 'achievements');
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, boolean>;
      this.unlockedMapSubject.next(parsed ?? {});
    } catch (e) {
      console.warn('No se pudo leer achievements desde localStorage', e);
    }
  }

  private saveToStorage(): void {
    try {
      if (typeof localStorage === 'undefined') return;
      const map = this.unlockedMapSubject.getValue();
      localStorage.setItem(GAME_PREFIX + 'achievements', JSON.stringify(map));
    } catch (e) {
      console.warn('No se pudo guardar achievements en localStorage', e);
    }
  }

  getAchievementById(id: string): Achievement | undefined {
    return ACHIEVEMENTS.find((a) => a.id === id);
  }

  // snapshot helper (valor síncrono)
  private unlockedMapSnapshot(): Record<string, boolean> {
    return this.unlockedMapSubject.getValue();
  }

  // desbloquea un logro y lo encola para notificación del popup
  unlockAchievement(id: string): boolean {
    const currentMap = this.unlockedMapSnapshot();
    const already = !!currentMap[id];
    if (already) return false;

    const ach = this.getAchievementById(id);
    if (!ach) {
      console.warn(`Achievement ${id} no existe.`);
      return false;
    }

    // actualiza mapa
    const nextMap = { ...currentMap, [id]: true };
    this.unlockedMapSubject.next(nextMap);

    // encola para popup si no está ya en la cola
    const q = this.queueSubject.getValue();
    const exists = q.some((x) => x.id === ach.id);
    if (!exists) {
      this.queueSubject.next([...q, ach]);
    }

    this.checkAchievements();
    return true;
  }

  // jaja referencia circular ._.
  private checkAchievements(){
    if (this.getUnlockedCount() >= 1){
      this.unlockAchievement("primer_achievement")
    }
    if (this.getUnlockedCount() >= this.getTotalCount() -1){
      this.unlockAchievement("todos_achievements")
    }
  }

  // Devuelve snapshot de todos los logros con su estado actual
  getAllWithState(): Array<Achievement & { unlocked: boolean }> {
    const map = this.unlockedMapSnapshot();
    return ACHIEVEMENTS.map((a) => ({ ...a, unlocked: !!map[a.id] }));
  }

  // Consumir (sacar) siguiente logro de la cola (lo usa el popup)
  consumeNext(): Achievement | undefined {
    const q = this.queueSubject.getValue();
    if (q.length === 0) return undefined;
    const [first, ...rest] = q;
    this.queueSubject.next(rest);
    return first;
  }

  // Reset (solo los logros)
  resetAll(): void {
    this.unlockedMapSubject.next({});
    this.queueSubject.next([]);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(GAME_PREFIX + 'achievements');
      }
    } catch {}
  }

  // getters útiles para templates/otros (síncronos)
  getUnlockedCount(): number {
    return Object.values(this.unlockedMapSnapshot()).filter(Boolean).length;
  }
  getTotalCount(): number {
    return ACHIEVEMENTS.length;
  }

  public unlockAllAchievements(): void {
    ACHIEVEMENTS.forEach((ach) => {
      this.unlockAchievement(ach.id);
    });
  }
}
