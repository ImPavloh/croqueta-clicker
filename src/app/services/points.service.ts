import { GoldenCroquetaService } from './golden-croqueta.service';
import { Injectable, signal, inject } from '@angular/core';
import Decimal from 'break_infinity.js';
import { FloatingService } from './floating.service';
import { OptionsService } from './options.service';

@Injectable({
  providedIn: 'root',
})
export class PointsService {
  private optionsService = inject(OptionsService);
  private goldenCroquetaService = inject(GoldenCroquetaService);
  // state usando Decimal en lugar de number
  private _points = signal<Decimal>(new Decimal(0));
  private _pointsPerSecond = signal<Decimal>(new Decimal(0));
  private _pointsPerClick = signal<Decimal>(new Decimal(1));
  private _multiply = signal<Decimal>(new Decimal(1));
  private isInitializing = true;
  private lastSaveTime: number = 0;

  // getter público (read-only signal)
  readonly points = this._points.asReadonly();
  readonly pointsPerSecond = this._pointsPerSecond.asReadonly();
  readonly pointsPerClick = this._pointsPerClick.asReadonly();
  readonly multiply = this._multiply.asReadonly();

  constructor(private floatingService: FloatingService) {
    this.loadFromStorage();

    // permitir guardados después de 2segs (evita guardados durante la carga inicial, lo mismo no es la mejor solucion pero funciona lol)
    setTimeout(() => {
      this.isInitializing = false;
    }, 2000);

    // Solo ejecutar en navegador
    if (typeof window !== 'undefined') {
      // Llamar addPointPerSecond cada segundo
      setInterval(() => this.addPointPerSecond(), 1000);
    }
  }

  // métodos para modificar el estado
  // añadir puntos (por click)
  addPointsPerClick(x?: number, y?: number) {
    // Check for golden croqueta bonus
    const bonusMultiplier = this.goldenCroquetaService.isBonusActive()
      ? this.goldenCroquetaService.bonusMultiplier
      : 1;

    // amount = pointsPerClick * multiply * bonusMultiplier
    const amount = this.pointsPerClick()
      .times(this.multiply())
      .times(bonusMultiplier);
    // actualizar puntos: v + amount
    this._points.update((v) => v.plus(amount));

    // mostrar texto flotante junto a la croqueta
    if (typeof window !== 'undefined' && amount.gt(0)) {
      // formatea como quieras; aquí uso toString()
      this.floatingService.show('+' + amount.toString(), { x, y });
    }

    // guardar inmediatamente al hacer click
    this.saveToStorage();
  }

  // añadir puntos por segundo
  addPointPerSecond() {
    // Check for golden croqueta bonus
    const bonusMultiplier = this.goldenCroquetaService.isBonusActive()
      ? this.goldenCroquetaService.bonusMultiplier
      : 1;

    const amount = this.pointsPerSecond().times(bonusMultiplier);
    this._points.update((v) => v.plus(amount));
    if (typeof window !== 'undefined' && amount.gt(0)) {
      this.floatingService.show('+' + amount.toString());
    }
    // guardar cada 30 segundos
    const currentTime = Date.now();
    if (!this.lastSaveTime || currentTime - this.lastSaveTime > 30000) {
      this.saveToStorage();
      this.lastSaveTime = currentTime;
    }
  }

  // actualizar puntos por click (recibe number | string | Decimal)
  upgradePointPerClick(value: number | string | Decimal) {
    this._pointsPerClick.set(new Decimal(value));
    this.saveToStorage();
  }

  // actualizar puntos por segundo (recibe number | string | Decimal)
  upgradePointsPerSecond(value: number | string | Decimal) {
    this._pointsPerSecond.set(new Decimal(value));
    this.saveToStorage();
  }

  // restar puntos
  substractPoints(value: number | string | Decimal) {
    const d = new Decimal(value);
    this._points.update((v) => v.minus(d));
    this.saveToStorage();
  }

  // persistencia simple en localStorage
  public loadFromStorage() {
    // si no hay localStorage, no hacer nada
    if (typeof localStorage === 'undefined') return;

    console.log('[PointsService] Cargando desde localStorage...');

    // cargar puntos
    const points = this.optionsService.getGameItem('points');
    if (points) {
      console.log('[PointsService] points:', points);
      this._points.set(new Decimal(points));
    }
    // cargar puntos por segundo
    const cps = this.optionsService.getGameItem('pointsPerSecond');
    if (cps) {
      console.log('[PointsService] pointsPerSecond:', cps);
      this._pointsPerSecond.set(new Decimal(cps));
    }
    // cargar puntos por click
    const cpc = this.optionsService.getGameItem('pointsPerClick');
    if (cpc) {
      console.log('[PointsService] pointsPerClick:', cpc);
      this._pointsPerClick.set(new Decimal(cpc));
    }
    // cargar multiplicador por click
    const cmc = this.optionsService.getGameItem('multiply');
    if (cmc) {
      console.log('[PointsService] multiply:', cmc);
      this._multiply.set(new Decimal(cmc));
    }
  }

  public saveToStorage() {
    // en carga inicial no guardar aún
    if (this.isInitializing) return;

    // si no hay localStorage, no hacer nada
    if (typeof localStorage === 'undefined') return;
    // guardar puntos como string
    this.optionsService.setGameItem('points', this._points().toString());
    // guardar puntos por segundo
    this.optionsService.setGameItem('pointsPerSecond', this._pointsPerSecond().toString());
    // guardar puntos por click
    this.optionsService.setGameItem('pointsPerClick', this._pointsPerClick().toString());
    // guardar multiplicador por click
    this.optionsService.setGameItem('multiply', this._multiply().toString());
  }

  public reset() {
    this._points.set(new Decimal(0));
    this._pointsPerSecond.set(new Decimal(0));
    this._pointsPerClick.set(new Decimal(1));
    this._multiply.set(new Decimal(1));
  }
}
