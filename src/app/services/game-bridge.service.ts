import { Injectable, signal, NgZone, inject } from '@angular/core';

/**
 * Puente entre el Game Loop y la UI de Angular
 */
@Injectable({
  providedIn: 'root',
})
export class GameBridgeService {
  private ngZone = inject(NgZone);

  private readonly UI_UPDATE_INTERVAL_MS = 50;
  private lastUiUpdate = 0;

  private rawPoints = 0;
  private rawPointsPerSecond = 0;
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
  updatePoints(value: number): void {
    this.rawPoints = value;
    this.hasPendingChanges = true;
  }

  /**
   * Actualiza los puntos por segundo desde el game loop
   */
  updatePointsPerSecond(value: number): void {
    this.rawPointsPerSecond = value;
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
  updateAll(points: number, pointsPerSecond: number, multiplier?: number): void {
    this.rawPoints = points;
    this.rawPointsPerSecond = pointsPerSecond;
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
  private static readonly UNITS: [number, string][] = [
    [1e63, 'Vg'], [1e60, 'Nv'], [1e57, 'Od'], [1e54, 'Sd'],
    [1e51, 'Sxd'], [1e48, 'Qnd'], [1e45, 'Qtd'], [1e42, 'Trd'],
    [1e39, 'Dod'], [1e36, 'Und'], [1e33, 'Dc'], [1e30, 'No'],
    [1e27, 'Oc'], [1e24, 'Sp'], [1e21, 'Sx'], [1e18, 'Qi'],
    [1e15, 'Qa'], [1e12, 'T'], [1e9, 'B'], [1e6, 'M'], [1e3, 'K'],
  ];

  private formatNumber(value: number): string {
    if (value < 1000) return Math.floor(value).toString();

    const abs = Math.abs(value);
    const sign = value < 0 ? '-' : '';

    for (const [threshold, suffix] of GameBridgeService.UNITS) {
      if (abs >= threshold) {
        const normalized = abs / threshold;
        const decimals = normalized < 10 ? 2 : normalized < 100 ? 1 : 0;
        return `${sign}${normalized.toFixed(decimals)}${suffix}`;
      }
    }

    return Math.floor(value).toString();
  }

  /**
   * Obtiene el valor raw de puntos (para cálculos internos)
   */
  getRawPoints(): number {
    return this.rawPoints;
  }

  /**
   * Obtiene el valor raw de puntos por segundo
   */
  getRawPointsPerSecond(): number {
    return this.rawPointsPerSecond;
  }

  ngOnDestroy(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }
}
