import { Injectable, signal } from '@angular/core';
import Decimal from 'break_infinity.js';
import { FloatingService } from './floating.service';

@Injectable({
  providedIn: 'root',
})
export class PointsService {
  // state usando Decimal en lugar de number
  private _points = signal<Decimal>(new Decimal(0));
  private _pointsPerSecond = signal<Decimal>(new Decimal(0));
  private _pointsPerClick = signal<Decimal>(new Decimal(1));
  private _multiply = signal<Decimal>(new Decimal(1));

  // getter público (read-only signal)
  readonly points = this._points.asReadonly();
  readonly pointsPerSecond = this._pointsPerSecond.asReadonly();
  readonly pointsPerClick = this._pointsPerClick.asReadonly();
  readonly multiply = this._multiply.asReadonly();

  // debounce para guardado automático
  private saveTimeout?: any;
  private readonly saveDebounceMs = 5000; // cada 5 segs máximo

  constructor(private floatingService: FloatingService) {
    // Solo ejecutar en navegador
    if (typeof window !== 'undefined') {
      // Llamar addPointPerSecond cada segundo
      setInterval(() => this.addPointPerSecond(), 1000);
    }
  }

  // métodos para modificar el estado
  // añadir puntos (por click)
  addPointsPerClick(x?: number, y?: number) {
    // amount = pointsPerClick * multiply
    const amount = this.pointsPerClick().times(this.multiply());
    // actualizar puntos: v + amount
    this._points.update((v) => v.plus(amount));

    // mostrar texto flotante junto a la croqueta
    if (typeof window !== 'undefined' && amount.gt(0)) {
      // formatea como quieras; aquí uso toString()
      this.floatingService.show('+' + amount.toString(), { x, y });
    }
  }

  // añadir puntos por segundo
  addPointPerSecond() {
    const amount = this.pointsPerSecond();
    this._points.update((v) => v.plus(amount));
    if (typeof window !== 'undefined' && amount.gt(0)) {
      this.floatingService.show('+' + amount.toString());
    }
    this.debouncedSave();
  }

  // actualizar puntos por click (recibe number | string | Decimal)
  upgradePointPerClick(value: number | string | Decimal) {
    this._pointsPerClick.set(new Decimal(value));
  }

  // actualizar puntos por segundo (recibe number | string | Decimal)
  upgradePointsPerSecond(value: number | string | Decimal) {
    this._pointsPerSecond.set(new Decimal(value));
  }

  // restar puntos
  substractPoints(value: number | string | Decimal) {
    const d = new Decimal(value);
    this._points.update((v) => v.minus(d));
  }

  // persistencia simple en localStorage
  loadFromStorage() {
    // si no hay localStorage, no hacer nada
    if (typeof localStorage === 'undefined') return;

    // cargar puntos
    const points = localStorage.getItem('points');
    if (points) this._points.set(new Decimal(points));
    // cargar puntos por segundo
    const cps = localStorage.getItem('pointsPerSecond');
    if (cps) this._pointsPerSecond.set(new Decimal(cps));
    // cargar puntos por click
    const cpc = localStorage.getItem('pointsPerClick');
    if (cpc) this._pointsPerClick.set(new Decimal(cpc));
    // cargar multiplicador por click
    const cmc = localStorage.getItem('multiply');
    if (cmc) this._multiply.set(new Decimal(cmc));
  }

  debouncedSave() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(() => {
      this.saveToStorage();
    }, this.saveDebounceMs);
  }

  saveToStorage() {
    // si no hay localStorage, no hacer nada
    if (typeof localStorage === 'undefined') return;
    // guardar puntos como string
    localStorage.setItem('points', this._points().toString());
    // guardar puntos por segundo
    localStorage.setItem('pointsPerSecond', this._pointsPerSecond().toString());
    // guardar puntos por click
    localStorage.setItem('pointsPerClick', this._pointsPerClick().toString());
    // guardar multiplicador por click
    localStorage.setItem('multiply', this._multiply().toString());
  }
}
