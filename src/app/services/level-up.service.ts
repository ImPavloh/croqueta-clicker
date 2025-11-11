import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface LevelUpNotification {
  level: number;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class LevelUpService {
  // simular cola de notificaciones de nivel con fifo
  private queueSubject = new BehaviorSubject<LevelUpNotification[]>([]);
  readonly queue$: Observable<LevelUpNotification[]> = this.queueSubject.asObservable();

  constructor() {}

  // notificación de subida de nivel a la cola
  notifyLevelUp(level: number): void {
    const notification: LevelUpNotification = {
      level,
      timestamp: Date.now()
    };

    const queue = this.queueSubject.getValue();
    // evitar duplicados
    const exists = queue.some(n => n.level === level && (Date.now() - n.timestamp) < 5000);
    if (!exists) {
      this.queueSubject.next([...queue, notification]);
    }
  }

  // sacar siguiente notificacion de la cola
  consumeNext(): LevelUpNotification | null {
    const queue = this.queueSubject.getValue();
    if (queue.length === 0) return null;

    const [first, ...rest] = queue;
    this.queueSubject.next(rest);
    return first;
  }
}
