import { Injectable, signal, computed } from '@angular/core';

const CROQUETA_DAY_MONTH = 0; // enero (0 indexado)
const CROQUETA_DAY_DATE = 16;
const STORAGE_KEY = 'croqueta-clicker_time_validation';
const MAX_TIME_DRIFT_MS = 24 * 60 * 60 * 1000; // 24h

interface TimeValidation {
  lastCheck: number;
  sessionStart: number;
  realTimePassed: number;
  lastValidCroquetaDay: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class TimeService {
  isCroquetaDay = signal<boolean>(false);
  isTimeManipulated = signal<boolean>(false);
  croquetaDayCountdown = signal<string>('');

  eventInfo = computed(() => ({
    isActive: this.isCroquetaDay(),
    multiplier: 3,
    date: `${CROQUETA_DAY_DATE}/01`,
    daysUntil: this.getDaysUntilCroquetaDay(),
  }));

  private sessionStartTime: number = 0;
  private lastPerformanceNow: number = 0;
  private checkInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.initializeTimeValidation();
  }

  private initializeTimeValidation(): void {
    if (typeof window === 'undefined') return;

    this.sessionStartTime = Date.now();
    this.lastPerformanceNow = performance.now();

    if (!this.validateTimeIntegrity()) {
      this.isTimeManipulated.set(true);
    }

    this.checkCroquetaDay();
    this.updateCountdown();

    this.checkInterval = setInterval(() => {
      this.periodicTimeCheck();
    }, 60000);

    this.saveValidationState();
  }

  private validateTimeIntegrity(): boolean {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return true;

      const validation: TimeValidation = JSON.parse(stored);
      const now = Date.now();
      const timeSinceLastCheck = now - validation.lastCheck;

      if (timeSinceLastCheck < -MAX_TIME_DRIFT_MS) {
        return false;
      }

      if (validation.lastValidCroquetaDay) {
        const lastCelebration = new Date(validation.lastValidCroquetaDay);
        const currentDate = new Date();

        if (lastCelebration > currentDate) {
          return false;
        }
      }

      return true;
    } catch {
      return true;
    }
  }

  private periodicTimeCheck(): void {
    const currentPerformance = performance.now();
    const expectedElapsed = currentPerformance - this.lastPerformanceNow;
    const actualElapsed = Date.now() - this.sessionStartTime;

    const drift = Math.abs(actualElapsed - expectedElapsed);

    if (drift > MAX_TIME_DRIFT_MS) {
      this.isTimeManipulated.set(true);
      this.isCroquetaDay.set(false);
    } else {
      if (!this.isTimeManipulated()) {
        this.checkCroquetaDay();
      }
    }

    this.updateCountdown();
    this.saveValidationState();
  }

  checkCroquetaDay(): void {
    if (typeof window === 'undefined') return;

    if (this.isTimeManipulated()) {
      this.isCroquetaDay.set(false);
      return;
    }

    const now = new Date();
    const month = now.getMonth();
    const day = now.getDate();

    const isCroquetaDay = month === CROQUETA_DAY_MONTH && day === CROQUETA_DAY_DATE;

    if (isCroquetaDay) {
      /*
      if (this.hasAlreadyCelebratedThisYear()) {
        this.isCroquetaDay.set(false);
        return;
      }
      */

      this.isCroquetaDay.set(true);
      this.markCroquetaDayCelebrated();
    } else {
      this.isCroquetaDay.set(false);
    }
  }

  private hasAlreadyCelebratedThisYear(): boolean {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return false;

      const validation: TimeValidation = JSON.parse(stored);
      if (!validation.lastValidCroquetaDay) return false;

      const lastCelebration = new Date(validation.lastValidCroquetaDay);
      const now = new Date();

      return lastCelebration.getFullYear() === now.getFullYear();
    } catch {
      return false;
    }
  }

  private markCroquetaDayCelebrated(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const validation: TimeValidation = stored
        ? JSON.parse(stored)
        : this.createInitialValidation();

      validation.lastValidCroquetaDay = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validation));
    } catch {}
  }

  private createInitialValidation(): TimeValidation {
    return {
      lastCheck: Date.now(),
      sessionStart: this.sessionStartTime,
      realTimePassed: 0,
      lastValidCroquetaDay: null,
    };
  }

  private saveValidationState(): void {
    try {
      const validation: TimeValidation = {
        lastCheck: Date.now(),
        sessionStart: this.sessionStartTime,
        realTimePassed: performance.now() - this.lastPerformanceNow,
        lastValidCroquetaDay: this.getStoredLastCelebration(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validation));
    } catch {}
  }

  private getStoredLastCelebration(): string | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      const validation: TimeValidation = JSON.parse(stored);
      return validation.lastValidCroquetaDay;
    } catch {
      return null;
    }
  }

  getDaysUntilCroquetaDay(): number {
    const now = new Date();
    const currentYear = now.getFullYear();
    let croquetaDay = new Date(currentYear, CROQUETA_DAY_MONTH, CROQUETA_DAY_DATE);

    if (now > croquetaDay) {
      croquetaDay = new Date(currentYear + 1, CROQUETA_DAY_MONTH, CROQUETA_DAY_DATE);
    }

    const diffTime = croquetaDay.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  private updateCountdown(): void {
    const days = this.getDaysUntilCroquetaDay();

    if (days === 0) {
      this.croquetaDayCountdown.set('¡HOY!');
    } else if (days === 1) {
      this.croquetaDayCountdown.set('¡Mañana!');
    } else {
      this.croquetaDayCountdown.set(`${days} días`);
    }
  }

  forceRefresh(): void {
    this.isTimeManipulated.set(false);
    this.checkCroquetaDay();
    this.updateCountdown();
  }

  ngOnDestroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }
}
