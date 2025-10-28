import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PlayerStats {
  // state
  private _totalClicks = signal<number>(0);
  private _level = signal<number>(0);
  private _expPerClick = signal<number>(1);
  private _expToNext = signal<number>(0);
  private _currentExp = signal<number>(0);
  private _achievements = signal<number>(0);
  private _timePlaying = signal<number>(0);

  // getter público (read-only signal)
  readonly totalClicks = this._totalClicks.asReadonly();
  readonly level = this._level.asReadonly();
  readonly currentExp = this._currentExp.asReadonly();
  readonly expPerClick = this._expPerClick.asReadonly();
  readonly archivements = this._achievements.asReadonly();
  readonly timePlaying = this._timePlaying.asReadonly();

  //Constructor
  constructor() {
    this.calculateExpToNext(); // Calcular EXP necesaria al inicializar
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
  public checkLevelUp():void{
    this._expToNext.update(e => e - this.expPerClick());
    //Comprobación que se haya superado el nivel
    if(this._currentExp >= this._expToNext){

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
  /**
   * TODO: archivements y timePlaying
   */
}
