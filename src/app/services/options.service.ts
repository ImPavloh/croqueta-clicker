import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AchievementsService } from './achievements.service';

@Injectable({
  providedIn: 'root',
})
export class OptionsService {
  // --- signals (mantengo tu API actual en 0..100 para bindear en la UI) ---
  private _generalVolume = signal<number>(100);
  private _musicVolume = signal<number>(100);
  private _sfxVolume = signal<number>(100);

  // read-only signals públicos (para usar en templates si quieres)
  readonly generalVolume = this._generalVolume.asReadonly();
  readonly musicVolume = this._musicVolume.asReadonly();
  readonly sfxVolume = this._sfxVolume.asReadonly();

  // --- Observables normalizados 0..1 (para AudioService) ---
  private _generalVolume$ = new BehaviorSubject<number>(1); // 0..1
  private _musicVolume$ = new BehaviorSubject<number>(1);
  private _sfxVolume$ = new BehaviorSubject<number>(1);

  // exposiciones públicas (nombres con $ para compatibilidad con la solución 2B)
  readonly generalVolume$: Observable<number> = this._generalVolume$.asObservable();
  readonly musicVolume$: Observable<number> = this._musicVolume$.asObservable();
  readonly sfxVolume$: Observable<number> = this._sfxVolume$.asObservable();

  constructor(public achievementsService: AchievementsService) {
    this.loadFromStorage();
  }

  // ----------------- setters públicos (reciben 0..100) -----------------
  setGeneralVolume(value: number) {
    const v = this.clamp100(value);
    this._generalVolume.set(v);
    this._generalVolume$.next(this.toUnit(v));
    this.saveToStorage();
    this.checkAchievements();
  }

  // Este cabrón hace lo que le sale de los huevos, como se vuelva a poner al 100% de la nada voy a apagar el PC y dedicarme a la cría de alpacas en los Andes.
  setMusicVolume(value: number) {
    const v = this.clamp100(value);
    this._musicVolume.set(v);
    this._musicVolume$.next(this.toUnit(v));
    this.saveToStorage();
    this.checkAchievements();
  }

  setSfxVolume(value: number) {
    const v = this.clamp100(value);
    this._sfxVolume.set(v);
    this._sfxVolume$.next(this.toUnit(v));
    this.saveToStorage();
    this.checkAchievements();
  }

  // ----------------- getters sincrónicos (devuelven 0..1) -----------------
  // AudioService y otros esperan valores 0..1, por eso estos getters devuelven 0..1
  getGeneral(): number {
    return this.toUnit(this._generalVolume());
  }
  getMusic(): number {
    return this.toUnit(this._musicVolume());
  }
  getSfx(): number {
    return this.toUnit(this._sfxVolume());
  }

  private clamp100(v: number) {
    if (isNaN(v)) return 0;
    return Math.max(0, Math.min(100, Math.round(v)));
  }
  private toUnit(v100: number) {
    // convert 0..100 -> 0..1 (float)
    return Math.max(0, Math.min(1, v100 / 100));
  }

  checkAchievements() {
    // ejemplo: desbloquear un logro si el volumen es exactamente 67
    if (this._generalVolume() === 67 && this._musicVolume() === 67 && this._sfxVolume() === 67) {
      this.achievementsService.unlockAchievement('six_seven');
    }
  }

  restartGame() {
    if (typeof localStorage === 'undefined') return;
    localStorage.clear();
    window.location.reload();
  }

  // persistencia simple en localStorage (valores 0..100)
  loadFromStorage() {
    if (typeof localStorage === 'undefined') return;
    const generalVolume = localStorage.getItem('generalVolume');
    if (generalVolume !== null) this._generalVolume.set(Number(generalVolume));

    const musicVolume = localStorage.getItem('musicVolume');
    if (musicVolume !== null) this._musicVolume.set(Number(musicVolume));

    const sfxVolume = localStorage.getItem('sfxVolume');
    if (sfxVolume !== null) this._sfxVolume.set(Number(sfxVolume));
  }

  saveToStorage() {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem('generalVolume', String(this._generalVolume()));
    localStorage.setItem('musicVolume', String(this._musicVolume()));
    localStorage.setItem('sfxVolume', String(this._sfxVolume()));
  }
}
