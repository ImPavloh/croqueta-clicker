import { Injectable, signal } from '@angular/core';
import { AchievementsService } from './achievements.service';


@Injectable({
    providedIn: 'root',
})
export class OptionsService {
    //state
    private _generalVolume = signal<number>(100);
    private _musicVolume = signal<number>(100);
    private _sfxVolume = signal<number>(100);

    // getter público (read-only signal)
    readonly generalVolume = this._generalVolume.asReadonly();
    readonly musicVolume = this._musicVolume.asReadonly();
    readonly sfxVolume = this._sfxVolume.asReadonly();

    // setter público
    setGeneralVolume(value: number) {
        this._generalVolume.set(value);
        this.saveToStorage();
        this.checkAchievements();
    }
    setMusicVolume(value: number) {
        this._musicVolume.set(value);
        this.saveToStorage();
        this.checkAchievements();
    }
    setSfxVolume(value: number) {
        this._sfxVolume.set(value);
        this.saveToStorage();
        this.checkAchievements();
    }

    constructor(public achievementsService: AchievementsService) {
        this.loadFromStorage();
    }

    checkAchievements() {
        // ejemplo: desbloquear un logro si el volumen general es 0 (silencio)
        if (this._generalVolume() === 67 && this._musicVolume() === 67 && this._sfxVolume() === 67) {
            this.achievementsService.unlockAchievement('six_seven');
        }
    }
    restartGame() {
        // resetear valores del pointsService antes de limpiar storage porque hace lo que le sale de los huevos
        // parece que AHORA esta funcionando sin resetear manualmente, pero lo dejo comentado por si acaso
        // me cago en todo igualmente
        /*
          this._points.set(0);
          this._pointsPerSecond.set(0);
          this._pointsPerClick.set(1);
          this._multiply.set(1);
          */

        // si no hay localStorage, no hacer nada
        if (typeof localStorage === 'undefined') return;
        // a la mierda tu partida 🗿
        localStorage.clear();
        // recargar la página para reiniciar el juego
        window.location.reload();
    }

    // persistencia simple en localStorage
    loadFromStorage() {
        // si no hay localStorage, no hacer nada
        if (typeof localStorage === 'undefined') return;
        // cargar volumenes
        const generalVolume = localStorage.getItem('generalVolume');
        if (generalVolume) this._generalVolume.set(Number(generalVolume) || 100);
        const musicVolume = localStorage.getItem('musicVolume');
        if (musicVolume) this._musicVolume.set(Number(musicVolume) || 100);
        const sfxVolume = localStorage.getItem('sfxVolume');
        if (sfxVolume) this._sfxVolume.set(Number(sfxVolume) || 100);
    }

    saveToStorage() {
        // si no hay localStorage, no hacer nada
        if (typeof localStorage === 'undefined') return;
        // guardar volumenes
        localStorage.setItem('generalVolume', String(this._generalVolume()));
        localStorage.setItem('musicVolume', String(this._musicVolume()));
        localStorage.setItem('sfxVolume', String(this._sfxVolume()));
    }
}