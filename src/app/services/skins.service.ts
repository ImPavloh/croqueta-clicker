import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AchievementsService } from './achievements.service';

@Injectable({
  providedIn: 'root',
})
export class SkinsService {
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
      console.log('Skin actualizada a ID:', id);
      this.skinsUsed.add(id);
      this.checkAchievements();
      this.saveToStorage();
    }

    private checkAchievements(){
      if (this.skinsUsed.size >= 1){
        this.achievementsService.unlockAchievement("primer_skin")
      }
      // VALOR HARDCODEADO, CUIDAO
      if (this.skinsUsed.size >= 16){
        this.achievementsService.unlockAchievement("todas_skins")
      }
    }

    // persistencia simple en localStorage
    loadFromStorage() {
        // si no hay localStorage, no hacer nada
        if (typeof localStorage === 'undefined') return;
        // cargar skin
        const skin = localStorage.getItem('skin');
        if (skin) this._skinId.next(Number(skin) || 0);
        // cargar skins usadas
        const skinsUsed = localStorage.getItem('skinsUsed');
        if (skinsUsed) this.skinsUsed = new Set(JSON.parse(skinsUsed));
    }

    saveToStorage() {
        // si no hay localStorage, no hacer nada
        if (typeof localStorage === 'undefined') return;
        // guardar skin
        localStorage.setItem('skin', String(this.skinId()));
        // guardar skins usadas
        localStorage.setItem('skinsUsed', JSON.stringify([...this.skinsUsed]));
    }
}
