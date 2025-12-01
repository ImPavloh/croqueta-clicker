import { Injectable, signal } from '@angular/core';

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
}

/**
 * Servicio para gestionar mensajes flotantes que aparecen en la UI.
 * Utilizado principalmente para mostrar puntos ganados al hacer clic.
 */
@Injectable({
  providedIn: 'root',
})
export class FloatingService {
  /** Signal privado que contiene todos los mensajes flotantes activos */
  private _messages = signal<FloatingMessage[]>([]);

  /** Signal público de solo lectura con los mensajes activos */
  readonly messages = this._messages.asReadonly();

  /** Contador para asignar IDs únicos a cada mensaje */
  private lastId = 0;

  constructor() {}

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

    const msg: FloatingMessage = { uid, text, rx, ry, duration, x, y };
    this._messages.update((a) => [...a, msg]);

    // borrar
    setTimeout(() => {
      this._messages.update((a) => a.filter((m) => m.uid !== uid));
    }, duration + 50);

    return uid;
  }
}
