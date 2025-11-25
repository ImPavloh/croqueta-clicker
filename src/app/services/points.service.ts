import { GoldenCroquetaService } from './golden-croqueta.service';
import { BurntCroquetaService } from './burnt-croqueta.service';
import { Injectable, signal, inject } from '@angular/core';
import Decimal from 'break_infinity.js';
import { FloatingService } from './floating.service';
import { OptionsService } from './options.service';
import { PRODUCERS } from '@data/producer.data';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PointsService {
  private optionsService = inject(OptionsService);
  private goldenCroquetaService = inject(GoldenCroquetaService);
  private _points = signal<Decimal>(new Decimal(0));
  private _pointsPerSecond = signal<Decimal>(new Decimal(0));
  private _pointsPerClick = signal<Decimal>(new Decimal(1));
  // multiplicador activo (puede venir de croqueta dorada o croqueta quemada)
  private _multiply = signal<Decimal>(new Decimal(1));
  readonly multiply = this._multiply.asReadonly();
  private isInitializing = true;
  private lastSaveTime: number = 0;

  // Subject para emitir eventos de clic manual
  private clickEvent$ = new Subject<Decimal>();
  public readonly onManualClick$ = this.clickEvent$.asObservable();

  // getter público (read-only signal)
  readonly points = this._points.asReadonly();
  readonly pointsPerSecond = this._pointsPerSecond.asReadonly();
  readonly pointsPerClick = this._pointsPerClick.asReadonly();

  private burntCroquetaService = inject(BurntCroquetaService);

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
    const multiplier = this.getActiveMultiplier();
    // keep observable state current for tests/ui
    this._multiply.set(new Decimal(multiplier));

    // amount = pointsPerClick * bonusMultiplier
    const amount = this.pointsPerClick().times(multiplier);
    // actualizar puntos: v + amount
    this._points.update((v) => v.plus(amount));

    // Emitir evento de clic manual con la cantidad ganada
    this.clickEvent$.next(amount);

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
    const multiplier = this.getActiveMultiplier();
    this._multiply.set(new Decimal(multiplier));
    const amount = this.pointsPerSecond().times(multiplier);
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

    // cargar puntos
    const points = this.optionsService.getGameItem('points');
    if (points) {
      this._points.set(new Decimal(points));
    }
    // cargar puntos por segundo
    const cps = this.optionsService.getGameItem('pointsPerSecond');
    if (cps) {
      this._pointsPerSecond.set(new Decimal(cps));
    } else {
      // si no hay cps guardado reconstruir sumando los productores guardados
      try {
        let total = new Decimal(0);
        for (const p of PRODUCERS) {
          const q =
            Number(this.optionsService.getGameItem('producer_' + p.id + '_quantity') || 0) || 0;
          if (q <= 0) continue;

          // total = base*q + pointsSum * (q*(q-1)/2)
          const base = new Decimal(p.pointsBase).times(q);
          const seq = (q * (q - 1)) / 2;
          const bonus = new Decimal(p.pointsSum).times(seq);
          total = total.plus(base).plus(bonus);
        }
        this._pointsPerSecond.set(total);
      } catch (e) {
        // en caso de error no bloquear la carga, cosa que no debería pasar but who knows
      }
    }
    // cargar puntos por click
    const cpc = this.optionsService.getGameItem('pointsPerClick');
    if (cpc) {
      this._pointsPerClick.set(new Decimal(cpc));
    }
    // cargar multiplicador almacenado (opcional)
    const m = this.optionsService.getGameItem('multiply');
    if (m) {
      try {
        this._multiply.set(new Decimal(m));
      } catch (e) {
        // ignore invalid stored value
      }
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
    // guardar multiplicador actual (por compatibilidad con tests / export)
    this.optionsService.setGameItem('multiply', this._multiply().toString());
  }

  public reset() {
    this._points.set(new Decimal(0));
    this._pointsPerSecond.set(new Decimal(0));
    this._pointsPerClick.set(new Decimal(1));
  }

  public addPoints(amount: number) {
    this._points.update((v) => v.plus(new Decimal(amount)));
    this.saveToStorage();
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

  public setMultiply(amount: number) {
    this._multiply.set(new Decimal(amount));
    this.saveToStorage();
  }

  private getActiveMultiplier(): number {
    // Prioridad: Golden > Burnt > 1
    if (this.goldenCroquetaService.isBonusActive())
      return Number(this.goldenCroquetaService.bonusMultiplier);
    if (this.burntCroquetaService.isPenaltyActive())
      return Number(this.burntCroquetaService.penaltyMultiplier);
    return 1;
  }
}
