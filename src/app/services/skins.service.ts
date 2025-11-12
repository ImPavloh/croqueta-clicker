import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AchievementsService } from './achievements.service';
import { OptionsService } from './options.service';

@Injectable({
  providedIn: 'root',
})
export class SkinsService {
  private optionsService = inject(OptionsService);
  // state
  private _skinId = new BehaviorSubject<number>(1);
  // getter público (read-only signal)
  skinChanged$ = this._skinId.asObservable();

  // skins probadas
  skinsUsed = new Set<number>();

  constructor(private achievementsService: AchievementsService) {
    this.loadFromStorage();
  }

  skinId() {
    return this._skinId.value;
  }
  // métodos para modificar el estado
  // actualizar skin
  updateSkin(id: number) {
    this._skinId.next(id);
    this.skinsUsed.add(id);
    this.checkAchievements();
    this.saveToStorage();
  }

  private checkAchievements() {
    if (this.skinsUsed.size >= 1) {
      this.achievementsService.unlockAchievement('primer_skin');
    }
    // VALOR HARDCODEADO, CUIDAO
    if (this.skinsUsed.size >= 16) {
      this.achievementsService.unlockAchievement('todas_skins');
    }
  }

  // persistencia simple en localStorage
  public loadFromStorage() {
    if (typeof localStorage === 'undefined') return;

    // cargar skin actual
    const skin = this.optionsService.getGameItem('skin');
    if (skin) this._skinId.next(Number(skin) || 0);

    // cargar skins usadas
    const skinsUsedStr = this.optionsService.getGameItem('skinsUsed');
    if (skinsUsedStr) {
      try {
        const skinsArray = JSON.parse(skinsUsedStr);
        this.skinsUsed = new Set(skinsArray);
      } catch (e) {
        console.warn('Error al cargar skinsUsed:', e);
      }
    }
  }

  public saveToStorage() {
    if (typeof localStorage === 'undefined') return;

    // guardar skin actual
    this.optionsService.setGameItem('skin', String(this.skinId()));

    // guardar skins usadas
    this.optionsService.setGameItem('skinsUsed', JSON.stringify([...this.skinsUsed]));
  }

  // Reset a estado inicial
  public reset() {
    this._skinId.next(1);
    this.skinsUsed.clear();
  }
}
