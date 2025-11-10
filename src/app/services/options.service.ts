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
  private _showCroquetita = signal<boolean>(true);
  private _showParticles = signal<boolean>(true);
  private _showFloatingText = signal<boolean>(true);

  // read-only signals públicos (para usar en templates si quieres)
  readonly generalVolume = this._generalVolume.asReadonly();
  readonly musicVolume = this._musicVolume.asReadonly();
  readonly sfxVolume = this._sfxVolume.asReadonly();
  readonly showCroquetita = this._showCroquetita.asReadonly();
  readonly showParticles = this._showParticles.asReadonly();
  readonly showFloatingText = this._showFloatingText.asReadonly();

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

  setShowCroquetita(value: boolean) {
    this._showCroquetita.set(value);
    this.saveToStorage();
  }

  setShowParticles(value: boolean) {
    this._showParticles.set(value);
    this.saveToStorage();
  }

  setShowFloatingText(value: boolean) {
    this._showFloatingText.set(value);
    this.saveToStorage();
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

    setTimeout(() => {
      window.location.replace(window.location.href);
    }, 0); // para que borre el storage antes de recargar
  }

  // exportar progreso como json
  exportProgress(): void {
    if (typeof localStorage === 'undefined') return;

    // capturar los datos del localStorage
    const saveData: Record<string, string | null> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        saveData[key] = localStorage.getItem(key);
      }
    }

    const exportData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      game: 'croqueta-clicker',
      data: saveData
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
    link.download = `croqueta-clicker-partida-${dateStr}-${timeStr}.json`;
    link.click();

    URL.revokeObjectURL(url);
  }

  // importar progreso con json
  importProgress(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const imported = JSON.parse(content);

          if (typeof localStorage === 'undefined') {
            reject('localStorage no disponible');
            return;
          }

          let saveData: Record<string, string | null>;

          if (imported.game === 'croqueta-clicker' && imported.data) {
            saveData = imported.data;
            console.log('Cargando partida guardada el:', imported.timestamp);
          } else if (typeof imported === 'object' && !imported.game) {
            saveData = imported;
            console.log('Cargando partida en formato antiguo');
          } else {
            reject('Archivo no válido. No es una partida de Croqueta Clicker.');
            return;
          }

          // limpiar storage actual
          localStorage.clear();

          // cargar los datos (no deberia de haber ningun dato null o undefined, pero por si acaso)
          let itemsLoaded = 0;
          for (const [key, value] of Object.entries(saveData)) {
            if (value !== null && value !== undefined) {
              localStorage.setItem(key, value as string);
              itemsLoaded++;
            }
          }

          resolve();
        } catch (error) {
          reject('Error al leer el archivo: ' + error);
        }
      };

      reader.onerror = () => reject('Error al leer el archivo');
      reader.readAsText(file);
    });
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

    const showCroquetita = localStorage.getItem('showCroquetita');
    if (showCroquetita !== null) this._showCroquetita.set(showCroquetita === 'true');

    const showParticles = localStorage.getItem('showParticles');
    if (showParticles !== null) this._showParticles.set(showParticles === 'true');

    const showFloatingText = localStorage.getItem('showFloatingText');
    if (showFloatingText !== null) this._showFloatingText.set(showFloatingText === 'true');
  }

  saveToStorage() {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem('generalVolume', String(this._generalVolume()));
    localStorage.setItem('musicVolume', String(this._musicVolume()));
    localStorage.setItem('sfxVolume', String(this._sfxVolume()));
    localStorage.setItem('showCroquetita', String(this._showCroquetita()));
    localStorage.setItem('showParticles', String(this._showParticles()));
    localStorage.setItem('showFloatingText', String(this._showFloatingText()));
  }
}
