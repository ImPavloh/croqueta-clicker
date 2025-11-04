import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SkinsService {
    // state
    private _skinId = new BehaviorSubject<number>(1);
    // getter público (read-only signal)
    skinChanged$ = this._skinId.asObservable();

    constructor() {
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
      this.saveToStorage();
    }

    // persistencia simple en localStorage
    loadFromStorage() {
        // si no hay localStorage, no hacer nada
        if (typeof localStorage === 'undefined') return;
        // cargar skin
        const skin = localStorage.getItem('skin');
        if (skin) this._skinId.next(Number(skin) || 0);
    }

    saveToStorage() {
        // si no hay localStorage, no hacer nada
        if (typeof localStorage === 'undefined') return;
        // guardar skin
        localStorage.setItem('skin', String(this.skinId()));
    }
}