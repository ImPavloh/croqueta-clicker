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
    this.saveToStorage();
  }

  setExp(exp: number): void {
    this._currentExp.set(exp);
    this.checkLevelUp();
    this.saveToStorage();
  }

  /**
   * Actualiza la experiencia por click
   * Recompensa el click activo sin desbordar niveles
   * Reduce el crecimiento y aplica soft cap en lategame
   */
  upgradeExpPerClick(pointsPerClick: Decimal): void {
    const powerPart = pointsPerClick.pow(0.5);
    const logPart = new Decimal(pointsPerClick.plus(1).log10()).times(2);
    let newExpDecimal = powerPart.plus(logPart).times(0.85);

    // Soft cap sobre la XP resultante para evitar explosiones en lategame
    // Si la xp por click supera 50 el exceso crece con rendimientos decrecientes
    const softCap = new Decimal(50);
    if (newExpDecimal.gt(softCap)) {
      newExpDecimal = softCap.plus(newExpDecimal.minus(softCap).pow(0.65));
    }

    newExpDecimal = newExpDecimal.floor();

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

    // aplicar cap porcentual relativo al nivel actual
    const expToNext = this._expToNext();
    const capPercent = this.getExpClickCapPercent();
    const maxAllowed = Math.max(1, Math.floor(expToNext * capPercent));
    if (newExp > maxAllowed) {
      newExp = maxAllowed;
    }

    this._expPerClick.set(Math.max(1, newExp)); // nunca menos de 1
  }

  // porcentaje máximo de exp que se puede otorgar un click respecto a expToNext
  // escala con el progreso para evitar saltos excesivos de niveles
  // cuanto más alto el nivel, menor el porcentaje permitido
  // seguramente haya que ajustarlo en el futuro (sobretodo si metemos los prestigios)
  private getExpClickCapPercent(): number {
    const lvl = this._level.value;
    if (lvl < 5) return 0.08; // muy early 8%
    if (lvl < 10) return 0.05; // early 5% para enganchar
    if (lvl < 20) return 0.04; // early tardío 4%
    if (lvl < 50) return 0.03; // mid temprano 3%
    if (lvl < 100) return 0.02; // mid tardío 2%
    if (lvl < 300) return 0.015; // late temprano 1%
    return 0.005; // late/end game 0.5%
  }

  /**
   * Calcula la experiencia necesaria por nivel
   * Curva para progresión satisfactoria
   */
  private calculateExpToNext(): void {
    const n = this._level.value;
    if (n === 0) {
      this._expToNext.set(150);
      return;
    }

    // Early game (1-20)
    // Mid game (21-60)
    // Late game (61-120)
    // Endgame (121+)

    let expNeeded: number;

    if (n <= 20) {
      // Early: 150 * 1.35^n
      // Nivel 1: 202, Nivel 5: 675, Nivel 10: 3,048, Nivel 20: 61,917
      expNeeded = Math.floor(150 * Math.pow(1.35, n));
    } else if (n <= 60) {
      // Mid: escalado fuerte pero predecible
      const earlyGameExp = Math.floor(150 * Math.pow(1.35, 20));
      const midGameLevels = n - 20;
      // ~1.18 por nivel = duplica cada ~4 niveles
      expNeeded = Math.floor(earlyGameExp * Math.pow(1.18, midGameLevels));
    } else if (n <= 120) {
      // Late: crecimiento más controlado para no bloquear
      const earlyGameExp = Math.floor(150 * Math.pow(1.35, 20));
      const midGameExp = Math.floor(earlyGameExp * Math.pow(1.18, 40));
      const lateGameLevels = n - 60;
      // ~1.12 por nivel = duplica cada ~6 niveles
      expNeeded = Math.floor(midGameExp * Math.pow(1.12, lateGameLevels));
    } else {
      // Endgame: crecimiento suave para permitir progreso continuo
      const earlyGameExp = Math.floor(150 * Math.pow(1.35, 20));
      const midGameExp = Math.floor(earlyGameExp * Math.pow(1.18, 40));
      const lateGameExp = Math.floor(midGameExp * Math.pow(1.12, 60));
      const endGameLevels = n - 120;
      // ~1.08 por nivel = duplica cada ~9 niveles
      expNeeded = Math.floor(lateGameExp * Math.pow(1.08, endGameLevels));
    }

    this._expToNext.set(Math.max(150, expNeeded));
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
