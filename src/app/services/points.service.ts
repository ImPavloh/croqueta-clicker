import { Injectable, signal } from '@angular/core';
import { FloatingService } from './floating.service';

@Injectable({
  providedIn: 'root',
})
export class PointsService {
  // state
  private _points = signal<number>(0);
  private _pointsPerSecond = signal<number>(0);
  private _pointsPerClick = signal<number>(1);
  private _multiply = signal<number>(1);

  // getter público (read-only signal)
  readonly points = this._points.asReadonly();
  readonly pointsPerSecond = this._pointsPerSecond.asReadonly();
  readonly pointsPerClick = this._pointsPerClick.asReadonly();
  readonly multiply = this._multiply.asReadonly();

  constructor(private floatingService: FloatingService) {
    // Solo ejecutar en navegador
    if (typeof window !== 'undefined') {
      // Llamar addPointPerSecond cada segundo
      setInterval(() => this.addPointPerSecond(), 1000);

      // Detectar F12 y llamar reset
      window.addEventListener('keydown', (event) => {
        if (event.key === 'F10') {
          this.resetStorage();
          window.location.reload();
        }
      });
    }
  }

  // métodos para modificar el estado
  // añadir puntos
  addPointsPerClick() {
    const amount = this.pointsPerClick() * this.multiply();
    this._points.update((v) => v + amount);

    // mostrar texto flotante junto a la croqueta
    if (typeof window !== 'undefined' && amount > 0) {
      this.floatingService.show('+' + amount);
    }
  }
  // añadir puntos por segundo
  addPointPerSecond() {
    const amount = this.pointsPerSecond();
    this._points.update((v) => v + amount);
    if (typeof window !== 'undefined' && amount > 0) {
      this.floatingService.show('+' + amount);
    }
    this.saveToStorage();
  }
  // actualizar puntos por click
  upgradePointPerClick(number: number) {
    this._pointsPerClick.set(number);
  }
  // actualizar puntos por segundo
  upgradePointsPerSecond(number: number) {
    this._pointsPerSecond.set(number);
  }
  // restar puntos
  substractPoints(number: number) {
    this._points.update((v) => v - number);
  }

  // TODO: Implementar lógica de puntos por click

  // persistencia simple en localStorage
  loadFromStorage() {
    // si no hay localStorage, no hacer nada
    if (typeof localStorage === 'undefined') return;
    // cargar puntos
    const points = localStorage.getItem('points');
    if (points) this._points.set(Number(points) || 0);
    // cargar puntos por segundo
    const cps = localStorage.getItem('pointsPerSecond');
    if (cps) this._pointsPerSecond.set(Number(cps) || 0);
    // cargar puntos por click
    const cpc = localStorage.getItem('pointsPerClick');
    if (cpc) this._pointsPerClick.set(Number(cpc) || 1);
    // cargar multiplicador por click
    const cmc = localStorage.getItem('multiply');
    if (cmc) this._multiply.set(Number(cmc) || 1);
  }

  saveToStorage() {
    // si no hay localStorage, no hacer nada
    if (typeof localStorage === 'undefined') return;
    // guardar puntos
    localStorage.setItem('points', String(this._points()));
    // guardar puntos por segundo
    localStorage.setItem('pointsPerSecond', String(this._pointsPerSecond()));
    // guardar puntos por click
    localStorage.setItem('pointsPerClick', String(this._pointsPerClick()));
    // guardar multipicador por click
    localStorage.setItem('multiply', String(this._multiply()));
  }

  resetStorage() {
    // si no hay localStorage, no hacer nada
    if (typeof localStorage === 'undefined') return;
    // a la mierda tu partida 🗿
    localStorage.clear();
  }
}
