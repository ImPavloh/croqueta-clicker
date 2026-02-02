import { Injectable, signal, NgZone, inject } from '@angular/core';

/**
 * Servicio para detectar y gestionar el rendimiento del dispositivo
 * Ajusta automáticamente configuraciones visuales para optimizar la experiencia
 * en dispositivos de gama baja o móviles
 */
@Injectable({
  providedIn: 'root',
})
export class PerformanceService {
  private ngZone = inject(NgZone);

  /** dispositivo es móvil */
  private _isMobile = signal<boolean>(false);
  readonly isMobile = this._isMobile.asReadonly();

  /** dispositivo de gama baja */
  private _isLowEnd = signal<boolean>(false);
  readonly isLowEnd = this._isLowEnd.asReadonly();

  /** dispositivo de muy baja gama */
  private _isVeryLowEnd = signal<boolean>(false);
  readonly isVeryLowEnd = this._isVeryLowEnd.asReadonly();

  /** calidad visual (0.0 - 1.0) */
  private _qualityFactor = signal<number>(1);
  readonly qualityFactor = this._qualityFactor.asReadonly();

  /** preferencia del usuario para reducir movimiento */
  private _prefersReducedMotion = signal<boolean>(false);
  readonly prefersReducedMotion = this._prefersReducedMotion.asReadonly();

  /** memoria del dispositivo en GB (si esta disponible) */
  private deviceMemory: number | undefined;

  /** núcleos del procesador */
  private hardwareConcurrency: number | undefined;

  /** FPS promedio medido */
  private _measuredFps = signal<number>(60);
  readonly measuredFps = this._measuredFps.asReadonly();

  private fpsHistory: number[] = [];
  private lastFrameTime: number = 0;
  private fpsCheckIntervalId?: ReturnType<typeof setInterval>;

  constructor() {
    this.detectDeviceCapabilities();
    this.detectMotionPreference();
    this.startFpsMonitoring();
  }

  private detectDeviceCapabilities(): void {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return;

    this._isMobile.set(
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    );

    this.deviceMemory = (navigator as any).deviceMemory;
    this.hardwareConcurrency = navigator.hardwareConcurrency;

    const isLowEnd =
      (this.hardwareConcurrency !== undefined && this.hardwareConcurrency <= 4) ||
      (this.deviceMemory !== undefined && this.deviceMemory <= 4);

    const isVeryLowEnd =
      (this.hardwareConcurrency !== undefined && this.hardwareConcurrency <= 2) ||
      (this.deviceMemory !== undefined && this.deviceMemory <= 2);

    this._isLowEnd.set(isLowEnd);
    this._isVeryLowEnd.set(isVeryLowEnd);

    let quality = 1;
    if (isVeryLowEnd) {
      quality = 0.3;
    } else if (isLowEnd) {
      quality = 0.5;
    } else if (this._isMobile()) {
      quality = 0.7;
    }

    this._qualityFactor.set(quality);
  }

  private detectMotionPreference(): void {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this._prefersReducedMotion.set(mediaQuery.matches);

    mediaQuery.addEventListener('change', (e) => {
      this._prefersReducedMotion.set(e.matches);
    });
  }

  private startFpsMonitoring(): void {
    if (typeof window === 'undefined' || typeof requestAnimationFrame === 'undefined') return;

    let frameCount = 0;
    this.lastFrameTime = performance.now();

    const measureFrame = () => {
      frameCount++;
      requestAnimationFrame(measureFrame);
    };

    this.ngZone.runOutsideAngular(() => {
      requestAnimationFrame(measureFrame);

      this.fpsCheckIntervalId = setInterval(() => {
        const now = performance.now();
        const elapsed = (now - this.lastFrameTime) / 1000;
        const fps = Math.round(frameCount / elapsed);

        this.fpsHistory.push(fps);
        if (this.fpsHistory.length > 10) {
          this.fpsHistory.shift();
        }

        const avgFps = Math.round(
          this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length,
        );
        this._measuredFps.set(avgFps);

        this.adjustQualityBasedOnFps(avgFps);

        frameCount = 0;
        this.lastFrameTime = now;
      }, 1000);
    });
  }

  private adjustQualityBasedOnFps(fps: number): void {
    if (fps < 25 && this._qualityFactor() > 0.3) {
      this._qualityFactor.update((q) => Math.max(0.3, q - 0.1));
    } else if (fps > 55 && this._qualityFactor() < 1) {
      if (!this._isLowEnd() && !this._isVeryLowEnd()) {
        this._qualityFactor.update((q) => Math.min(1, q + 0.05));
      }
    }
  }

  getMaxParticles(): number {
    const quality = this._qualityFactor();
    if (quality <= 0.3) return 8;
    if (quality <= 0.5) return 15;
    if (quality <= 0.7) return 25;
    return 50;
  }

  getMaxFloatingMessages(): number {
    const quality = this._qualityFactor();
    if (quality <= 0.3) return 3;
    if (quality <= 0.5) return 5;
    if (quality <= 0.7) return 8;
    return 15;
  }

  shouldShowHeavyEffects(): boolean {
    return this._qualityFactor() >= 0.5 && !this._prefersReducedMotion();
  }

  getAnimationDuration(baseDuration: number): number {
    if (this._prefersReducedMotion()) return 0;
    return Math.round(baseDuration * Math.max(0.5, this._qualityFactor()));
  }

  ngOnDestroy(): void {
    if (this.fpsCheckIntervalId) {
      clearInterval(this.fpsCheckIntervalId);
    }
  }
}
