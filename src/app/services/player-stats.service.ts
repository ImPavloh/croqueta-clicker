import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PlayerStats{
  // state
  private _totalClicks = signal<number>(0);
  private _level = signal<number>(0);
  private _expPerClick = signal<number>(1);
  private _expToNext = signal<number>(0);
  private _currentExp = signal<number>(0);
  private _archivements = signal<number>(0);
  private _timePlaying = signal<number>(0);

  private intervalId: any;
  private isTimerRunning  = false;

  // getter público (read-only signal)
  readonly totalClicks = this._totalClicks.asReadonly();
  readonly level = this._level.asReadonly();
  readonly currentExp = this._currentExp.asReadonly();
  readonly expToNext = this._expToNext.asReadonly();
  readonly expPerClick = this._expPerClick.asReadonly();
  readonly archivements = this._archivements.asReadonly();
  readonly timePlaying = this._timePlaying.asReadonly();

  //Constructor
  constructor() {
    console.log('🔴 PlayerStats CONSTRUCTOR ejecutado');
  }

  //metodos

  /**
   * Por cada click se actualiza el número de total de clicks en 1
   */
  addClick(): void {
    this._totalClicks.update(clicks => clicks +1)
    this._currentExp.update(total => total + this._expPerClick())
    this.checkLevelUp();
  }

  /**
   * Actualiza la experiecien por click
   * @param newExp Nueva exp por click
   */
  upgradeExpPerClick(newExp:number){
    this._expPerClick.set(newExp);
  }

  /**
   * Calcula la experiencia necesaria por nivel a través de un formula cuadratica
   */
  private calculateExpToNext(): void {
    // Suponiendo que el nivel depende de los clics
    const n = this._level();
    const a = 50;
    const b = 50;

    // Fórmula cuadrática para comprobar la exp necesaria por nivel
    const expNeeded = a * Math.pow(n, 2) + b * n;

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
  private levelUp(expExtra:number):void{
    //Actualización de nivel
    this._level.update(level => level +1);
    //Actualizar la exp actual con la exp sobrante
    this._currentExp.set(expExtra);
    //Volver a calcular cuanta exp necesita el nivel
    this.calculateExpToNext();
    //Verificar si con la exp sobrante se puede subir de nivel
    this.checkLevelUp();
  }

  startTimer() {
    if (this.isTimerRunning) return;

    this.isTimerRunning = true;
    this.intervalId = setInterval(() => {
      this._timePlaying.update(current => {
        console.log('🕐 Time playing:', current + 1);
        return current + 1;
      });
    }, 1000);
  }
  stopTimer() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.isTimerRunning = false;
    }
  }
  /**
   * TODO: archivements
   */

  loadFromStorage(){
    if (typeof localStorage == "undefined") return;

    const epc = localStorage.getItem("expPerClick");
    if (epc) this._expPerClick.set(Number(epc));

    const etn = localStorage.getItem("expToNext");
    if (etn) this._expToNext.set(Number(etn));

    const arch = localStorage.getItem("archivements");
    if (arch) this._archivements.set(Number(arch));

    const lvl =localStorage.getItem("level");
    if(lvl) this._level.set(Number(lvl));

    const tc = localStorage.getItem("totalClicks");
    if (tc) this._totalClicks.set(Number(tc));

    const ce = localStorage.getItem("currentExp");
    if (ce) this._currentExp.set(Number(ce));

    const tp = localStorage.getItem("timePlaying");
    if (tp) this._timePlaying.set(Number(tp));
  }
  saveToStorage() {
    // si no hay localStorage, no hacer nada
    if (typeof localStorage === 'undefined') return;
    // guardar experiencia por click
    localStorage.setItem('expPerClick', String(this._expPerClick()));
    // guardar experiencia necesaria para el siguiente nivel
    localStorage.setItem('expToNext', String(this._expToNext()));
    // guardar logros
    localStorage.setItem('archivements', String(this._archivements()));
    // guardar mnivel
    localStorage.setItem('level', String(this._level()));
    // guardar los clicks totales realizados
    localStorage.setItem('totalClicks', String(this._totalClicks()));
    // guardar la experiencia actual
    localStorage.setItem('currentExp', String(this._currentExp()));
    // guardar el tiempo jugado
    localStorage.setItem('timePlaying', String(this._timePlaying()));
  }
  resetStorage() {
    // si no hay localStorage, no hacer nada
    if (typeof localStorage === 'undefined') return;
    // a la mierda tu partida 🗿
    localStorage.clear();
  }
}
