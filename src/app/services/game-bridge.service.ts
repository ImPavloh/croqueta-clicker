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
   * Formatea números grandes para mostrar en UI
   * Reutiliza lógica común sin crear objetos
   */
  private formatNumber(value: number): string {
    if (value < 1000) return Math.floor(value).toString();
    if (value < 1000000) return (value / 1000).toFixed(1) + 'K';
    if (value < 1000000000) return (value / 1000000).toFixed(2) + 'M';
    if (value < 1000000000000) return (value / 1000000000).toFixed(2) + 'B';
    return (value / 1000000000000).toFixed(2) + 'T';
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
