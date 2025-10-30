import { Injectable, signal } from '@angular/core';

export interface FloatingMessage {
  uid: number;
  text: string;
  rx: number;
  ry: number;
  duration: number;
}

@Injectable({
  providedIn: 'root',
})
export class FloatingService {
  private _messages = signal<FloatingMessage[]>([]);
  readonly messages = this._messages.asReadonly();

  private lastId = 0;

  constructor() {}

  // mostrar el mensaje flotante (puntos por segundo)
  show(text: string, options?: { duration?: number }) {
    const duration = options?.duration ?? 900;
    const uid = ++this.lastId;

    const rx = Math.round((Math.random() - 0.5) * 80); // -40..40
    const ry = Math.round((Math.random() - 0.5) * 40); // -20..20

    const msg: FloatingMessage = { uid, text, rx, ry, duration };
    this._messages.update((a) => [...a, msg]);

    // borrar
    setTimeout(() => {
      this._messages.update((a) => a.filter((m) => m.uid !== uid));
    }, duration + 50);

    return uid;
  }
}
