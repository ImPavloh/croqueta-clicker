import { Injectable, signal, inject, Injector } from '@angular/core';
import Decimal from 'break_infinity.js';
import { FloatingService } from './floating.service';
import { OptionsService } from './options.service';
import { PRODUCERS } from '@data/producer.data';
import { Subject } from 'rxjs';
import { TimeService } from './time.service';
import { AutosaveService } from './autosave.service';
import { TranslocoService } from '@jsverse/transloco';
import { ModalService } from './modal.service';

interface Multiplier {
  value: number;
  duration: number;
  id: number;
}

@Injectable({
  providedIn: 'root',
})
export class PointsService {
  private optionsService = inject(OptionsService);
  private injector = inject(Injector);
  private modalService = inject(ModalService);

  private get autosaveService(): AutosaveService {
    return this.injector.get(AutosaveService);
  }

  private _points = signal<Decimal>(new Decimal(0));
  private _pointsPerSecond = signal<Decimal>(new Decimal(0));
  private _pointsPerClick = signal<Decimal>(new Decimal(1));
  private _multipliers = signal<Multiplier[]>([]);
  private multiplierIdCounter = 0;
  private isInitializing = true;
  private lastSaveTime: number = 0;

  // Configurable offline threshold
  private readonly OFFLINE_THRESHOLD_MS = 600000; // 10 minute

  private clickEvent$ = new Subject<Decimal>();
  public readonly onManualClick$ = this.clickEvent$.asObservable();

  readonly points = this._points.asReadonly();
  readonly pointsPerSecond = this._pointsPerSecond.asReadonly();
  readonly pointsPerClick = this._pointsPerClick.asReadonly();

  constructor(private floatingService: FloatingService, private timeService: TimeService) {
    this.loadFromStorage();

    // Defer check to ensure app is fully initialized and avoid potential constructor race conditions
    setTimeout(() => {
      this.checkOfflineProgress();
    }, 1000);

    setTimeout(() => {
      this.isInitializing = false;
    }, 2000);

    if (typeof window !== 'undefined') {
      setInterval(() => this.addPointPerSecond(), 1000);
    }
  }

  addPointsPerClick(x?: number, y?: number) {
    const multiplier = this.getActiveMultiplier();
    const amount = this.pointsPerClick().times(multiplier);
    this._points.update((v) => v.plus(amount));
    this.clickEvent$.next(amount);

    if (typeof window !== 'undefined' && amount.gt(0)) {
      this.floatingService.show('+' + amount.toString(), { x, y });
    }
    this.autosaveService.requestSave();
  }

  addPointPerSecond() {
    const multiplier = this.getActiveMultiplier();
    const amount = this.pointsPerSecond().times(multiplier);
    this._points.update((v) => v.plus(amount));
    if (typeof window !== 'undefined' && amount.gt(0)) {
      this.floatingService.show('+' + amount.toString());
    }

    this.autosaveService.requestSave();
  }

  upgradePointPerClick(value: number | string | Decimal) {
    this._pointsPerClick.set(new Decimal(value));
    this.saveToStorage();
  }

  upgradePointsPerSecond(value: number | string | Decimal) {
    this._pointsPerSecond.set(new Decimal(value));
    this.saveToStorage();
  }

  substractPoints(value: number | string | Decimal) {
    const d = new Decimal(value);
    this._points.update((v) => v.minus(d));
    this.saveToStorage();
  }

  addMultiplier(value: number, duration: number) {
    const id = this.multiplierIdCounter++;
    const newMultiplier: Multiplier = { id, value, duration };
    this._multipliers.update(m => [...m, newMultiplier]);

    setTimeout(() => {
      this._multipliers.update(m => m.filter(m => m.id !== id));
    }, duration);
  }

  getActiveMultiplier(): number {
    let multiplier = this._multipliers().reduce((acc, m) => acc * m.value, 1);
    if (this.timeService.isCroquetaDay()) {
      multiplier *= 3;
    }
    return multiplier;
  }

  getPointsPerSecond(): Decimal {
    // Retornamos el valor base. El multiplicador se aplica en el momento de añadir los puntos.
    // OJO: Si la UI muestra CpS * multiplicador, habría que ajustarlo aquí o en la UI.
    // Actualmente parece que getPointsPerSecond devuelve el base.
    // Vamos a dejarlo así para no romper la UI, pero el cálculo offline usará el base por ahora (o con multiplicador si queremos ser generosos).
    // Usualmente offline no incluye multiplicadores temporales, pero si son pasivos permanentes sí.
    return this._pointsPerSecond();
  }

  public loadFromStorage() {
    if (typeof localStorage === 'undefined') return;

    const points = this.optionsService.getGameItem('points');
    if (points) {
      this._points.set(new Decimal(points));
    }
    const cps = this.optionsService.getGameItem('pointsPerSecond');
    if (cps) {
      this._pointsPerSecond.set(new Decimal(cps));
    } else {
      try {
        let total = new Decimal(0);
        for (const p of PRODUCERS) {
          const q =
            Number(this.optionsService.getGameItem('producer_' + p.id + '_quantity') || 0) || 0;
          if (q <= 0) continue;

          const base = new Decimal(p.pointsBase).times(q);
          const seq = (q * (q - 1)) / 2;
          const bonus = new Decimal(p.pointsSum).times(seq);
          total = total.plus(base).plus(bonus);
        }
        this._pointsPerSecond.set(total);
      } catch (e) {
        // ignore error
      }
    }
    const cpc = this.optionsService.getGameItem('pointsPerClick');
    if (cpc) {
      this._pointsPerClick.set(new Decimal(cpc));
    }

    const lastSave = this.optionsService.getGameItem('last_save_time');
    if (lastSave) {
      this.lastSaveTime = Number(lastSave);
    }
  }

  public saveToStorage() {
    if (this.isInitializing) return;
    if (typeof localStorage === 'undefined') return;

    this.optionsService.setGameItem('points', this._points().toString());
    this.optionsService.setGameItem('pointsPerSecond', this._pointsPerSecond().toString());
    this.optionsService.setGameItem('pointsPerClick', this._pointsPerClick().toString());
    this.optionsService.setGameItem('last_save_time', Date.now().toString());
  }

  private translocoService = inject(TranslocoService);

  // ... (rest of the properties)

  private checkOfflineProgress() {
    try {
      console.log('Checking offline progress...', { lastSaveTime: this.lastSaveTime, now: Date.now() });
      if (!this.lastSaveTime) {
        console.log('No last save time found.');
        return;
      }

      const now = Date.now();
      const diff = now - this.lastSaveTime;
      console.log('Time diff:', diff, 'Threshold:', this.OFFLINE_THRESHOLD_MS);

      if (diff > this.OFFLINE_THRESHOLD_MS) {
        // Recalculate CPS to be sure
        const cps = this.calculateCpsFromProducers();
        console.log('CPS:', cps.toString());

        if (cps.lte(0)) {
          console.log('CPS is <= 0');
          return;
        }

        // Calcular segundos completos
        const seconds = Math.floor(diff / 1000);

        // 50% de producción (0.5x)
        const offlineFactor = 0.5;
        const earned = cps.times(seconds).times(offlineFactor);
        console.log('Offline earned:', earned.toString());

        if (earned.gt(0)) {
          console.log('Awarding points');
          this.addPoints(earned);

          // Formatear el mensaje
          const formattedEarned = this.formatPoints(earned);

          // Usar setTimeout para asegurar que la UI esté lista o darle un pequeño delay visual
          setTimeout(() => {
            this.modalService.showConfirm({
              title: this.translocoService.translate('offline.title'),
              message: this.translocoService.translate('offline.message', { amount: formattedEarned }),
              confirmText: this.translocoService.translate('offline.confirm'),
              onConfirm: () => {
                this.modalService.closeConfirm();
              }
            });
          }, 1000);
        }
      } else {
        console.log('Diff below threshold');
      }
    } catch (error) {
      console.warn('Error checking offline progress:', error);
    }
  }

  // Method to recalculate CPS on demand securely
  private calculateCpsFromProducers(): Decimal {
    try {
      let total = new Decimal(0);
      for (const p of PRODUCERS) {
        const q = Number(this.optionsService.getGameItem('producer_' + p.id + '_quantity') || 0) || 0;
        if (q <= 0) continue;

        const base = new Decimal(p.pointsBase).times(q);
        const seq = (q * (q - 1)) / 2;
        const bonus = new Decimal(p.pointsSum).times(seq);
        total = total.plus(base).plus(bonus);
      }
      return total;
    } catch (e) {
      return new Decimal(0);
    }
  }

  public reset() {
    this._points.set(new Decimal(0));
    this._pointsPerSecond.set(new Decimal(0));
    this._pointsPerClick.set(new Decimal(1));
  }

  public addPoints(amount: Decimal) {
    this._points.update((v) => v.plus(amount));
    this.autosaveService.requestSave();
  }

  public setPoints(amount: number) {
    this._points.set(new Decimal(amount));
    this.saveToStorage();
  }

  public addCps(amount: number) {
    this._pointsPerSecond.update((v) => v.plus(new Decimal(amount)));
    this.saveToStorage();
  }

  public setCps(amount: number) {
    this._pointsPerSecond.set(new Decimal(amount));
    this.saveToStorage();
  }

  public setPointsPerClick(amount: number) {
    this._pointsPerClick.set(new Decimal(amount));
    this.saveToStorage();
  }

  public formatPoints(value: Decimal | number | string | null | undefined, maxDecimals = 2): string {
    if (value == null) return '0';

    // Convertir a Decimal de forma segura
    let num: Decimal;
    try {
      num = value instanceof Decimal ? value : new Decimal(value);
    } catch {
      return String(value);
    }

    const sign = num.lt(0) ? '-' : '';
    const abs = num.abs();

    // Escalas con sufijos
    const units: { value: Decimal; symbol: string }[] = [
      { value: new Decimal(1e63), symbol: 'Vg' }, // vigintillón
      { value: new Decimal(1e60), symbol: 'Nv' }, // novendecillón
      { value: new Decimal(1e57), symbol: 'Od' }, // octodecillón
      { value: new Decimal(1e54), symbol: 'Sd' }, // septendecillón
      { value: new Decimal(1e51), symbol: 'Sxd' }, // sexdecillón
      { value: new Decimal(1e48), symbol: 'Qnd' }, // quindecillón
      { value: new Decimal(1e45), symbol: 'Qtd' }, // cuatordecillón
      { value: new Decimal(1e42), symbol: 'Trd' }, // tredecillón
      { value: new Decimal(1e39), symbol: 'Dod' }, // duodecillón
      { value: new Decimal(1e36), symbol: 'Und' }, // undecillón
      { value: new Decimal(1e33), symbol: 'Dc' }, // decillón
      { value: new Decimal(1e30), symbol: 'No' }, // nonillón
      { value: new Decimal(1e27), symbol: 'Oc' }, // octillón
      { value: new Decimal(1e24), symbol: 'Sp' }, // septillón
      { value: new Decimal(1e21), symbol: 'Sx' }, // sextillón
      { value: new Decimal(1e18), symbol: 'Qi' }, // quintillón
      { value: new Decimal(1e15), symbol: 'Qa' }, // cuatrillón
      { value: new Decimal(1e12), symbol: 'T' }, // trillón
      { value: new Decimal(1e9), symbol: 'B' }, // mil millones (billón)
      { value: new Decimal(1e6), symbol: 'M' }, // millón
      { value: new Decimal(1e3), symbol: 'K' }, // mil
    ];

    for (const u of units) {
      if (abs.gte(u.value)) {
        const normalized = abs.div(u.value);
        const decimals = normalized.lt(10)
          ? Math.min(2, maxDecimals)
          : normalized.lt(100)
            ? Math.min(1, maxDecimals)
            : 0;

        try {
          const formatted = normalized
            .toFixed(decimals)
            .replace(/\.0+$/, '')
            .replace(/(\.[0-9]*[1-9])0+$/, '$1');
          return `${sign}${formatted}${u.symbol}`;
        } catch {
          // usar notación científica como fallback
          return `${sign}${normalized.toExponential(2)}${u.symbol}`;
        }
      }
    }

    // Mostrar número completo si es menor a 1000
    if (abs.lt(10000)) {
      try {
        const formatted = abs
          .toFixed(maxDecimals)
          .replace(/\.0+$/, '')
          .replace(/(\.[0-9]*[1-9])0+$/, '$1');
        return `${sign}${formatted}`;
      } catch {
        // usar el valor sin formato como fallback
        return `${sign}${abs.toString()}`;
      }
    }

    // Fallback para números que no coincidan con ninguna escala
    try {
      return `${sign}${abs.toFixed(0)}`;
    } catch {
      return `${sign}${abs.toString()}`;
    }
  }
}
