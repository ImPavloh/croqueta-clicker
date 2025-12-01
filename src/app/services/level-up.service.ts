import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Interfaz que representa una notificación de subida de nivel.
 */
export interface LevelUpNotification {
  /** Nivel alcanzado */
  level: number;
  /** Timestamp de cuando ocurrió la subida de nivel */
  timestamp: number;
}

/**
 * Servicio para gestionar notificaciones de subida de nivel.
 * Implementa un sistema de cola FIFO para mostrar las notificaciones secuencialmente.
 */
@Injectable({ providedIn: 'root' })
export class LevelUpService {
  /** Subject privado que gestiona la cola de notificaciones */
  private queueSubject = new BehaviorSubject<LevelUpNotification[]>([]);

  /** Observable público de la cola de notificaciones */
  readonly queue$: Observable<LevelUpNotification[]> = this.queueSubject.asObservable();

  constructor() {}

  /**
   * Añade una notificación de subida de nivel a la cola.
   * Evita duplicados si ya existe una notificación reciente del mismo nivel.
   * @param level Número del nivel alcanzado
   */
  notifyLevelUp(level: number): void {
    const notification: LevelUpNotification = {
      level,
      timestamp: Date.now(),
    };

    const queue = this.queueSubject.getValue();
    // evitar duplicados
    const exists = queue.some((n) => n.level === level && Date.now() - n.timestamp < 5000);
    if (!exists) {
      this.queueSubject.next([...queue, notification]);
    }
  }

  /**
   * Consume y retorna la siguiente notificación de la cola (FIFO).
   * @returns La primera notificación de la cola, o null si la cola está vacía
   */
  consumeNext(): LevelUpNotification | null {
    const queue = this.queueSubject.getValue();
    if (queue.length === 0) return null;

    const [first, ...rest] = queue;
    this.queueSubject.next(rest);
    return first;
  }
}
