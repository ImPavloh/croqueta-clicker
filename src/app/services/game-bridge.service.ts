import { Injectable, signal, NgZone, inject, OnDestroy } from '@angular/core';
import Decimal from 'break_infinity.js';

/**
 * Puente entre el Game Loop y la UI de Angular
 */
@Injectable({
  providedIn: 'root',
})
export class GameBridgeService implements OnDestroy {
  private ngZone = inject(NgZone);

  private readonly UI_UPDATE_INTERVAL_MS = 50;
  private lastUiUpdate = 0;

  private rawPoints = new Decimal(0);
  private rawPointsPerSecond = new Decimal(0);
  private rawMultiplier = 1;

  private _displayPoints = signal<string>('0');
  private _displayPointsPerSecond = signal<string>('0');
  private _displayMultiplier = signal<string>('1x');

  readonly displayPoints = this._displayPoints.asReadonly();
  readonly displayPointsPerSecond = this._displayPointsPerSecond.asReadonly();
  readonly displayMultiplier = this._displayMultiplier.asReadonly();

  private hasPendingChanges = false;
  private rafId?: number;

  constructor() {
    this.startUiUpdateLoop();
  }

  /**
   * Inicia el loop de actualización de UI
   */
  private startUiUpdateLoop(): void {
    if (typeof window === 'undefined') return;

    const updateLoop = () => {
      const now = performance.now();

      if (this.hasPendingChanges && now - this.lastUiUpdate >= this.UI_UPDATE_INTERVAL_MS) {
        this._displayPoints.set(this.formatNumber(this.rawPoints));
        this._displayPointsPerSecond.set(this.formatNumber(this.rawPointsPerSecond));
        this._displayMultiplier.set(`${this.rawMultiplier}x`);

        this.lastUiUpdate = now;
        this.hasPendingChanges = false;
      }

      this.rafId = requestAnimationFrame(updateLoop);
    };

    this.ngZone.runOutsideAngular(() => {
      this.rafId = requestAnimationFrame(updateLoop);
    });
  }

  /**
   * Actualiza los puntos desde el game loop
   */
  updatePoints(value: Decimal | number | string): void {
    this.rawPoints = value instanceof Decimal ? value : new Decimal(value);
    this.hasPendingChanges = true;
  }

  /**
   * Actualiza los puntos por segundo desde el game loop
   */
  updatePointsPerSecond(value: Decimal | number | string): void {
    this.rawPointsPerSecond = value instanceof Decimal ? value : new Decimal(value);
    this.hasPendingChanges = true;
  }

  /**
   * Actualiza el multiplicador activo
   */
  updateMultiplier(value: number): void {
    this.rawMultiplier = value;
    this.hasPendingChanges = true;
  }

  /**
   * Actualiza múltiples valores a la vez
   */
  updateAll(
    points: Decimal | number | string,
    pointsPerSecond: Decimal | number | string,
    multiplier?: number,
  ): void {
    this.rawPoints = points instanceof Decimal ? points : new Decimal(points);
    this.rawPointsPerSecond =
      pointsPerSecond instanceof Decimal ? pointsPerSecond : new Decimal(pointsPerSecond);
    if (multiplier !== undefined) {
      this.rawMultiplier = multiplier;
    }
    this.hasPendingChanges = true;
  }

  /**
   * Fuerza una actualización inmediata de la UI
   * Usar solo cuando sea necesario (como al pausar el juego por ejemplo)
   */
  forceUiUpdate(): void {
    this._displayPoints.set(this.formatNumber(this.rawPoints));
    this._displayPointsPerSecond.set(this.formatNumber(this.rawPointsPerSecond));
    this._displayMultiplier.set(`${this.rawMultiplier}x`);
    this.hasPendingChanges = false;
  }

  /**
   * Formatea números grandes para mostrar en UI.
   * Escalas alineadas con PointsService.formatPoints() para consistencia.
   */
  private static readonly UNITS: readonly (readonly [Decimal, string])[] = [
    [new Decimal('1e63'), 'Vg'],
    [new Decimal('1e60'), 'Nv'],
    [new Decimal('1e57'), 'Od'],
    [new Decimal('1e54'), 'Sd'],
    [new Decimal('1e51'), 'Sxd'],
    [new Decimal('1e48'), 'Qnd'],
    [new Decimal('1e45'), 'Qtd'],
    [new Decimal('1e42'), 'Trd'],
    [new Decimal('1e39'), 'Dod'],
    [new Decimal('1e36'), 'Und'],
    [new Decimal('1e33'), 'Dc'],
    [new Decimal('1e30'), 'No'],
    [new Decimal('1e27'), 'Oc'],
    [new Decimal('1e24'), 'Sp'],
    [new Decimal('1e21'), 'Sx'],
    [new Decimal('1e18'), 'Qi'],
    [new Decimal('1e15'), 'Qa'],
    [new Decimal('1e12'), 'T'],
    [new Decimal('1e9'), 'B'],
    [new Decimal('1e6'), 'M'],
    [new Decimal('1e3'), 'K'],
  ];

  private formatNumber(value: Decimal): string {
    const abs = value.abs();
    const sign = value.lt(0) ? '-' : '';

    if (abs.lt(1000)) {
      return `${sign}${abs.floor().toString()}`;
    }

    for (const [threshold, suffix] of GameBridgeService.UNITS) {
      if (abs.gte(threshold)) {
        const normalized = abs.div(threshold);
        const decimals = normalized.lt(10) ? 2 : normalized.lt(100) ? 1 : 0;
        const formatted = normalized
          .toFixed(decimals)
          .replace(/\.0+$/, '')
          .replace(/(\.[0-9]*[1-9])0+$/, '$1');
        return `${sign}${formatted}${suffix}`;
      }
    }

    return `${sign}${abs.floor().toString()}`;
  }

  /**
   * Obtiene el valor raw de puntos (para cálculos internos)
   */
  getRawPoints(): Decimal {
    return this.rawPoints;
  }

  /**
   * Obtiene el valor raw de puntos por segundo
   */
  getRawPointsPerSecond(): Decimal {
    return this.rawPointsPerSecond;
  }

  ngOnDestroy(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }
}
