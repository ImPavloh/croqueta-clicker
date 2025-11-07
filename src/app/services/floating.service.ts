import { Injectable, signal } from '@angular/core';

export interface FloatingMessage {
  uid: number;
  text: string;
  rx: number;
  ry: number;
  duration: number;
  x?: number;
  y?: number;
}

@Injectable({
  providedIn: 'root',
})
export class FloatingService {
  private _messages = signal<FloatingMessage[]>([]);
  readonly messages = this._messages.asReadonly();

  private lastId = 0;

  constructor() {}

  // mostrar el mensaje flotante (puntos/croquetas)
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
