import { Injectable, signal, OnDestroy } from '@angular/core';

/**
 * Interfaz que define la estructura de un mensaje flotante en la UI.
 */
export interface FloatingMessage {
  /** Identificador único del mensaje */
  uid: number;
  /** Texto a mostrar */
  text: string;
  /** Desplazamiento horizontal relativo (para animación) */
  rx: number;
  /** Desplazamiento vertical relativo (para animación) */
  ry: number;
  /** Duración de la animación en milisegundos */
  duration: number;
  /** Indica si el mensaje es dorado (evento especial) */
  isGolden?: boolean;
  /** Posición X absoluta (opcional, si no se usa rx) */
  x?: number;
  /** Posición Y absoluta (opcional, si no se usa ry) */
  y?: number;
  /** Timestamp de creación */
  startTime: number;
}

/**
 * Servicio para gestionar mensajes flotantes que aparecen en la UI.
 * Utilizado principalmente para mostrar puntos ganados al hacer clic.
 */
@Injectable({
  providedIn: 'root',
})
export class FloatingService implements OnDestroy {
  /** Signal privado que contiene todos los mensajes flotantes activos */
  private _messages = signal<FloatingMessage[]>([]);

  /** Signal público de solo lectura con los mensajes activos */
  readonly messages = this._messages.asReadonly();

  /** Contador para asignar IDs únicos a cada mensaje */
  private lastId = 0;

  /** Pool de mensajes reutilizables */
  private deadPool: FloatingMessage[] = [];

  private cleanupIntervalId?: any;

  /** Número máximo de mensajes activos */
  private readonly maxMessages = this.getMaxMessages();

  constructor() {
    if (typeof window !== 'undefined') {
      this.cleanupIntervalId = setInterval(() => this.cleanup(), 500);
    }
  }

  /** Calcula el número max de mensajes flotantes basado en el dispositivo */
  private getMaxMessages(): number {
    if (typeof window === 'undefined') return 8;

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
    const isLowEnd = navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 4 : false;
    const isVeryLowEnd = navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 2 : false;

    if (isVeryLowEnd || (isMobile && isLowEnd)) return 4;
    if (isMobile) return 6;
    if (isLowEnd) return 8;
    return 15;
  }

  ngOnDestroy() {
    if (this.cleanupIntervalId) {
      clearInterval(this.cleanupIntervalId);
    }
  }

  /**
   * Muestra un mensaje flotante en la UI.
   * @param text Texto a mostrar
   * @param options Opciones de configuración del mensaje
   * @param options.duration Duración de la animación en ms (por defecto 900ms)
   * @param options.x Posición X absoluta (opcional)
   * @param options.y Posición Y absoluta (opcional)
   * @returns ID único del mensaje creado
   */
  show(text: string, options?: { duration?: number; x?: number; y?: number }) {
    // limitar mensajes activos
    if (this._messages().length >= this.maxMessages) {
      return -1;
    }

    const duration = options?.duration ?? 900;
    const uid = ++this.lastId;

    let rx: number;
    let ry: number;
    let x: number | undefined;
    let y: number | undefined;

    if (options?.x !== undefined && options?.y !== undefined) {
      x = options.x;
      y = options.y - 60; // un poco más arriba del click (ajuste visual))
      rx = 0;
      ry = 0;
    } else {
      rx = Math.round((Math.random() - 0.5) * 80); // -40..40
      ry = Math.round((Math.random() - 0.5) * 40); // -20..20
    }

    const now = Date.now();
    let msg: FloatingMessage;

    if (this.deadPool.length > 0) {
      msg = this.deadPool.pop()!;
      msg.uid = uid;
      msg.text = text;
      msg.rx = rx;
      msg.ry = ry;
      msg.duration = duration;
      msg.x = x;
      msg.y = y;
      msg.startTime = now;
      // Reset optional properties if needed, though they are overwritten above if set
    } else {
      msg = { uid, text, rx, ry, duration, x, y, startTime: now };
    }

    this._messages.update((a) => [...a, msg]);

    return uid;
  }

  private cleanup() {
    const now = Date.now();
    const current = this._messages();
    if (current.length === 0) return;

    // +50 ms de margen como en el original
    // Separar activos de expirados
    const active: FloatingMessage[] = [];
    const expired: FloatingMessage[] = [];

    for (const m of current) {
      // +50 ms de margen
      if (now - m.startTime < m.duration + 50) {
        active.push(m);
      } else {
        expired.push(m);
      }
    }

    if (active.length !== current.length) {
      this.deadPool.push(...expired);
      // Limitar pool
      if (this.deadPool.length > 50) this.deadPool.length = 50;
      this._messages.set(active);
    }
  }
}
