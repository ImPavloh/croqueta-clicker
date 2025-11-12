import { Injectable, signal, inject } from '@angular/core';
import Decimal from 'break_infinity.js';
import { BehaviorSubject } from 'rxjs';
import { OptionsService } from './options.service';
import { LevelUpService } from './level-up.service';
import { AchievementsService } from './achievements.service';

@Injectable({
  providedIn: 'root',
})
export class PlayerStats {
  private optionsService = inject(OptionsService);
  private levelUpService = inject(LevelUpService);
  private achievementsService = inject(AchievementsService);

  // state (signals)
  private _totalClicks = signal<number>(0);
  private _currentExp = signal<number>(0);
  private _expPerClick = signal<number>(1);
  private _expToNext = signal<number>(0);
  private _timePlaying = signal<number>(0);

  // BehaviorSubject para el nivel actual
  public _level = new BehaviorSubject<number>(0);

  private intervalId: any;
  private isTimerRunning = false;
  private isInitializing = true;

  // getter público (read-only signals)
  readonly totalClicks = this._totalClicks.asReadonly();
  readonly currentExp = this._currentExp.asReadonly();
  readonly expToNext = this._expToNext.asReadonly();
  readonly expPerClick = this._expPerClick.asReadonly();
  readonly timePlaying = this._timePlaying.asReadonly();

  // getter para nivel (BehaviorSubject)
  readonly level$ = this._level.asObservable();

  // Constructor
  constructor() {
    this.loadFromStorage();

    setTimeout(() => {
      this.isInitializing = false;
    }, 2000);

    // inicializar expToNext en base al nivel inicial
    this.calculateExpToNext();

    // Iniciar el timer automáticamente
    this.startTimer();
  }

  // métodos

  /**
   * Por cada click se actualiza el número de total de clicks en 1
   */
  addClick(): void {
    this._totalClicks.update((clicks) => clicks + 1);
    this._currentExp.update((total) => total + this._expPerClick());
    this.checkLevelUp();
    // Guardar cada 10 clicks para evitar saturar localStorage
    if (this._totalClicks() % 10 === 0) {
      this.saveToStorage();
    }
  }

  addExp(exp: number): void {
    this._currentExp.update((total) => total + exp);
    this.checkLevelUp();
    // guardar cuando se añade experiencia de forma externa (compra de productores/upgrades)
    this.saveToStorage();
  }

  /**
   * Actualiza la experiencia por click
   * @param newExp Nueva exp por click
   */
  upgradeExpPerClick(pointsPerClick: Decimal): void {
    // curva suavizada: XP ≈ (puntosPorClick ^ 0.8) + (puntosPorClick / 3)
    let newExpDecimal = pointsPerClick.pow(0.8).plus(pointsPerClick.dividedBy(3)).floor();

    // convertir a number de forma segura
    let newExp: number;
    try {
      newExp = newExpDecimal.toNumber();
      if (!isFinite(newExp) || Number.isNaN(newExp)) {
        newExp = Number.MAX_SAFE_INTEGER;
      }
    } catch {
      newExp = Number.MAX_SAFE_INTEGER;
    }

    this._expPerClick.set(Math.max(1, newExp)); // nunca menos de 1
  }

  /**
   * Calcula la experiencia necesaria por nivel a través de una fórmula cuadrática
   */
  private calculateExpToNext(): void {
    const n = this._level.value;
    const baseExp = 100; // XP base del nivel 1
    const growth = 1.2; // crecimiento por nivel (ajustable)
    const expNeeded = Math.floor(baseExp * Math.pow(growth, n));

    this._expToNext.set(expNeeded);
  }

  /**
   * Comprueba si se ha subido de nivel
   */
  public checkLevelUp(): void {
    while (this._currentExp() >= this._expToNext()) {
      const expExtra = this._currentExp() - this._expToNext();
      this.levelUp(expExtra);
    }
  }

  /**
   * Acción cuando se sube de nivel
   */
  private levelUp(expExtra: number): void {
    // Actualización de nivel
    const nextLevel = this._level.value + 1;
    this._level.next(nextLevel);

    // Notificar al servicio de level-up solo si no estamos en inicialización
    if (!this.isInitializing) {
      this.levelUpService.notifyLevelUp(nextLevel);
    }

    // Actualizar la exp actual con la exp sobrante
    this._currentExp.set(expExtra);

    // Volver a calcular cuanta exp necesita el nivel
    this.calculateExpToNext();

    // Guardar progreso al subir de nivel
    this.saveToStorage();

    // Verificar si con la exp sobrante se puede subir de nivel
    this.checkLevelUp();

    this.checkAchievements();
  }

  private checkAchievements() {
    var level = this._level.value;

    switch (level) {
      case 5:
        this.achievementsService.unlockAchievement('nivel_5');
        break;
      case 10:
        this.achievementsService.unlockAchievement('nivel_10');
        break;
      case 15:
        this.achievementsService.unlockAchievement('nivel_15');
        break;
      case 20:
        this.achievementsService.unlockAchievement('nivel_20');
        break;
      case 25:
        this.achievementsService.unlockAchievement('nivel_25');
        break;
      case 30:
        this.achievementsService.unlockAchievement('nivel_30');
        break;
      case 50:
        this.achievementsService.unlockAchievement('nivel_50');
        break;
      case 60:
        this.achievementsService.unlockAchievement('nivel_60');
        break;
      case 80:
        this.achievementsService.unlockAchievement('nivel_80');
        break;
      case 100:
        this.achievementsService.unlockAchievement('nivel_100');
        break;
      case 1000:
        this.achievementsService.unlockAchievement('nivel_1000');
        break;
      case 10000:
        this.achievementsService.unlockAchievement('nivel_10000');
        break;
    }
  }

  startTimer() {
    if (this.isTimerRunning) return;

    this.isTimerRunning = true;
    this.intervalId = setInterval(() => {
      this._timePlaying.update((current) => {
        const newValue = current + 1;
        // guardar cada 10 segundos
        if (newValue % 10 === 0) {
          this.saveToStorage();
        }
        return newValue;
      });
    }, 1000);
  }

  stopTimer() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.isTimerRunning = false;
      this.saveToStorage();
    }
  }

  public loadFromStorage() {
    if (typeof localStorage == 'undefined') return;

    const epc = this.optionsService.getGameItem('expPerClick');
    if (epc) {
      this._expPerClick.set(Number(epc));
    }

    const etn = this.optionsService.getGameItem('expToNext');
    if (etn) {
      this._expToNext.set(Number(etn));
    }

    const lvl = this.optionsService.getGameItem('level');
    if (lvl) {
      this._level.next(Number(lvl));
    }

    const tc = this.optionsService.getGameItem('totalClicks');
    if (tc) {
      this._totalClicks.set(Number(tc));
    }

    const ce = this.optionsService.getGameItem('currentExp');
    if (ce) {
      this._currentExp.set(Number(ce));
    }

    const tp = this.optionsService.getGameItem('timePlaying');
    if (tp) {
      this._timePlaying.set(Number(tp));
    }

    // después de cargar el nivel, recalcular expToNext por si usas el valor guardado
    this.calculateExpToNext();
  }

  public saveToStorage() {
    if (this.isInitializing) return;

    // si no hay localStorage, no hacer nada
    if (typeof localStorage === 'undefined') return;
    // guardar experiencia por click
    this.optionsService.setGameItem('expPerClick', String(this._expPerClick()));
    // guardar experiencia necesaria para el siguiente nivel
    this.optionsService.setGameItem('expToNext', String(this._expToNext()));
    // guardar nivel
    this.optionsService.setGameItem('level', String(this._level.value));
    // guardar los clicks totales realizados
    this.optionsService.setGameItem('totalClicks', String(this._totalClicks()));
    // guardar la experiencia actual
    this.optionsService.setGameItem('currentExp', String(this._currentExp()));
    // guardar el tiempo jugado
    this.optionsService.setGameItem('timePlaying', String(this._timePlaying()));
  }

  public reset() {
    this._totalClicks.set(0);
    this._currentExp.set(0);
    this._expPerClick.set(1);
    this._timePlaying.set(0);
    this._level.next(0);
    this.calculateExpToNext();
  }
}
