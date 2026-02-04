import { Injectable, signal, NgZone, inject, isDevMode, OnDestroy } from '@angular/core';

/**
 * Servicio para detectar y gestionar el rendimiento del dispositivo
 * Ajusta automáticamente configuraciones visuales para optimizar la experiencia
 * en dispositivos de gama baja o móviles
 */
@Injectable({
  providedIn: 'root',
})
export class PerformanceService implements OnDestroy {
  private ngZone = inject(NgZone);
  private fpsMonitoringActive = false;

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

  private _fpsMonitoringEnabled = signal<boolean>(false);
  readonly fpsMonitoringEnabled = this._fpsMonitoringEnabled.asReadonly();

  private fpsHistory: number[] = [];
  private lastFrameTime: number = 0;
  private fpsCheckIntervalId?: ReturnType<typeof setInterval>;
  private rafId?: number;

  constructor() {
    this.detectDeviceCapabilities();
    this.detectMotionPreference();
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
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this._prefersReducedMotion.set(mediaQuery.matches);

    mediaQuery.addEventListener('change', (e) => {
      this._prefersReducedMotion.set(e.matches);
    });
  }

  /**
   * Activa el monitoreo de FPS
   * ADVERTENCIA: Consume recursos, usalo en desarrollo o cuando sea necesario (how ironic xd)
   */
  enableFpsMonitoring(): void {
    if (this.fpsMonitoringActive) return;
    this.fpsMonitoringActive = true;
    this._fpsMonitoringEnabled.set(true);
    this.startFpsMonitoring();
  }

  /**
   * Desactiva el monitoreo de FPS para ahorrar recursos
   */
  disableFpsMonitoring(): void {
    if (!this.fpsMonitoringActive) return;
    this.fpsMonitoringActive = false;
    this._fpsMonitoringEnabled.set(false);
    this.stopFpsMonitoring();
  }

  /**
   * Inicia el monitoreo de FPS
   */
  private startFpsMonitoring(): void {
    if (typeof window === 'undefined' || typeof requestAnimationFrame === 'undefined') return;

    let frameCount = 0;
    let sampleCounter = 0;
    this.lastFrameTime = performance.now();

    const measureFrame = () => {
      frameCount++;
      this.rafId = requestAnimationFrame(measureFrame);
    };

    this.ngZone.runOutsideAngular(() => {
      this.rafId = requestAnimationFrame(measureFrame);

      this.fpsCheckIntervalId = setInterval(() => {
        if (!this.fpsMonitoringActive) return;
        sampleCounter++;
        if (sampleCounter % 2 !== 0) return;

        const calculateFps = () => {
          const now = performance.now();
          const elapsed = (now - this.lastFrameTime) / 1000;
          if (elapsed <= 0) return;

          const fps = Math.round(frameCount / elapsed);

          if (this.fpsHistory.length >= 5) {
            this.fpsHistory[sampleCounter % 5] = fps;
          } else {
            this.fpsHistory.push(fps);
          }

          let sum = 0;
          for (let i = 0; i < this.fpsHistory.length; i++) {
            sum += this.fpsHistory[i];
          }
          const avgFps = Math.round(sum / this.fpsHistory.length);
          this._measuredFps.set(avgFps);

          this.adjustQualityBasedOnFps(avgFps);

          frameCount = 0;
          this.lastFrameTime = now;
        };

        if ('requestIdleCallback' in window) {
          (window as any).requestIdleCallback(calculateFps, { timeout: 100 });
        } else {
          calculateFps();
        }
      }, 2000);
    });
  }

  /**
   * Detiene el monitoreo de FPS y limpia recursos
   */
  private stopFpsMonitoring(): void {
    if (this.fpsCheckIntervalId) {
      clearInterval(this.fpsCheckIntervalId);
      this.fpsCheckIntervalId = undefined;
    }
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = undefined;
    }
    this.fpsHistory = [];
    this._measuredFps.set(60);
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
    this.disableFpsMonitoring();
  }
}
