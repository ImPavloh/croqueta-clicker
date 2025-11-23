import { Injectable, signal, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AchievementsService } from './achievements.service';
import { SupabaseService } from './supabase.service';
import { GAME_PREFIX } from '@app/config/constants';

@Injectable({
  providedIn: 'root',
})
export class OptionsService {
  private _generalVolume = signal<number>(100);
  private _musicVolume = signal<number>(100);
  private _sfxVolume = signal<number>(100);
  private _showCroquetita = signal<boolean>(true);
  private _showParticles = signal<boolean>(true);
  private _showFloatingText = signal<boolean>(true);

  // read-only signals públicos (para usar en templates)
  readonly generalVolume = this._generalVolume.asReadonly();
  readonly musicVolume = this._musicVolume.asReadonly();
  readonly sfxVolume = this._sfxVolume.asReadonly();
  readonly showCroquetita = this._showCroquetita.asReadonly();
  readonly showParticles = this._showParticles.asReadonly();
  readonly showFloatingText = this._showFloatingText.asReadonly();

  // versión para cambiar cuándo hay cambios en items guardados
  private _gameItemsVersion = signal<number>(0);
  readonly gameItemsVersion = this._gameItemsVersion.asReadonly();

  // observables normalizados 0..1 para AudioService
  private _generalVolume$ = new BehaviorSubject<number>(1); // 0..1
  private _musicVolume$ = new BehaviorSubject<number>(1);
  private _sfxVolume$ = new BehaviorSubject<number>(1);

  // exposiciones públicas
  readonly generalVolume$: Observable<number> = this._generalVolume$.asObservable();
  readonly musicVolume$: Observable<number> = this._musicVolume$.asObservable();
  readonly sfxVolume$: Observable<number> = this._sfxVolume$.asObservable();

  constructor(
    public achievementsService: AchievementsService,
    private supabaseService: SupabaseService
  ) {
    // comprueba si localStorage funciona
    this._localStorageAvailable = this.checkLocalStorageAvailability();
    if (!this._localStorageAvailable) {
      console.warn(
        'localStorage no disponible o no persistente: los progresos no se guardarán en esta sesión'
      );
    }

    this.loadFromStorage();
    // Intentar solicitar persistencia
    this.requestPersistentStorage();
  }

  // flag interno para comprobar si localStorage es usable (no privado o bloqueado)
  private _localStorageAvailable = true;

  private checkLocalStorageAvailability(): boolean {
    if (typeof localStorage === 'undefined') return false;
    try {
      const testKey = '__cc_test__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
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

  // getters sincrónicos (devuelven 0..1)
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
    // 0..100 -> 0..1 (float)
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
    // desbloqueo del logro si el volumen es exactamente 67
    if (this._generalVolume() === 67 && this._musicVolume() === 67 && this._sfxVolume() === 67) {
      this.achievementsService.unlockAchievement('six_seven');
    }
  }

  restartGame() {
    if (typeof localStorage === 'undefined') return;

    // borrar SOLO las keys del juego (con prefijo)
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(GAME_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));

    // También resetear achievements explícitamente
    this.achievementsService.resetAll();

    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }

  // exportar progreso como json
  exportProgress(): void {
    if (typeof localStorage === 'undefined') return;

    // ejecutar exportación asíncrona
    void this.performExport();
  }

  private async performExport(): Promise<void> {
    // capturar SOLO los datos del juego (keys con prefijo)
    const saveData: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(GAME_PREFIX)) {
        const value = localStorage.getItem(key);
        if (value !== null) {
          // guardar sin el prefijo para archivo más limpio
          const keyWithoutPrefix = key.substring(GAME_PREFIX.length);
          saveData[keyWithoutPrefix] = value;
        }
      }
    }

    // Tambien incluir en la exportación datos adicionales útiles
    const pending = localStorage.getItem('leaderboard:pending');

    let supabaseSession: any = null;
    let userId: string | null = null;
    try {
      const client = this.supabaseService.getClient();
      // getSession returns { data: { session } }
      const sessResp = await client.auth.getSession();
      supabaseSession = sessResp?.data?.session ?? null;
      userId = sessResp?.data?.session?.user?.id ?? null;
    } catch (e) {
      // ignorar si el cliente de supabase no está listo
      supabaseSession = null;
    }

    const exportData = {
      version: '1.1',
      timestamp: new Date().toISOString(),
      game: 'croqueta-clicker',
      userId: userId,
      data: saveData,
      pendingLeaderboard: pending,
      supabaseSession: supabaseSession,
      // Security notice included in export
      _securityNotice:
        'Este archivo contiene tokens de sesión sensibles. NO LO COMPARTAS CON NADIE. Úsalo solo en tus propios dispositivos.',
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

      reader.onload = async (e) => {
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
          } else if (typeof imported === 'object' && !imported.game) {
            saveData = imported;
          } else {
            reject('Archivo no válido. No es una partida de Croqueta Clicker');
            return;
          }

          // limpiar solo las keys (con prefijo)
          const keysToRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(GAME_PREFIX)) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach((key) => localStorage.removeItem(key));

          // First: if the imported file contained a supabase session, try to restore it
          // This enables transferring your anonymous identity between devices.
          // The system will attempt to refresh the session if tokens are expired.
          let sessionRestored = false;
          try {
            const session = (imported as any).supabaseSession;
            if (session && session.access_token && session.refresh_token) {
              console.info('[Import] Intentando restaurar sesión anónima de Supabase...');
              try {
                const client = this.supabaseService.getClient();
                // setSession will automatically refresh if the access_token is expired
                // but the refresh_token is still valid
                const result = await client.auth.setSession({
                  access_token: session.access_token,
                  refresh_token: session.refresh_token,
                });

                if (result.error) {
                  console.warn('[Import] Error al restaurar sesión:', result.error.message);
                  console.info('[Import] Se creará una nueva sesión anónima automáticamente.');
                } else {
                  sessionRestored = true;
                  console.info(
                    '[Import] ✓ Sesión restaurada correctamente. User ID:',
                    result.data.session?.user?.id
                  );

                  // Validate that the restored user_id matches the exported one (if available)
                  const exportedUserId = (imported as any).userId;
                  const restoredUserId = result.data.session?.user?.id;
                  if (exportedUserId && restoredUserId && exportedUserId !== restoredUserId) {
                    console.warn(
                      '[Import] ⚠️ ADVERTENCIA: El user_id restaurado no coincide con el exportado.'
                    );
                    console.warn(
                      '[Import] Exportado:',
                      exportedUserId,
                      '| Restaurado:',
                      restoredUserId
                    );
                  }
                }
              } catch (e) {
                console.warn('[Import] Excepción al restaurar sesión:', e);
              }
            } else {
              console.info('[Import] No se encontró sesión de Supabase en el archivo.');
            }
          } catch (e) {
            console.warn('[Import] Error procesando sesión:', e);
          }

          if (!sessionRestored) {
            console.info(
              '[Import] Continuando sin sesión restaurada. La app usará la sesión actual/nueva.'
            );
          }

          // Restaurar cola pendiente del leaderboard si está presente (esto preserva la cola offline)
          try {
            const pending = (imported as any).pendingLeaderboard ?? null;
            if (pending !== null && pending !== undefined) {
              localStorage.setItem('leaderboard:pending', String(pending));
            }
          } catch (e) {
            // ignorar
          }

          // cargar los datos con el prefijo
          let itemsLoaded = 0;
          for (const [key, value] of Object.entries(saveData)) {
            if (value !== null && value !== undefined) {
              localStorage.setItem(GAME_PREFIX + key, value as string);
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
  public loadFromStorage() {
    if (typeof localStorage === 'undefined') return;
    const generalVolume = localStorage.getItem(GAME_PREFIX + 'generalVolume');
    if (generalVolume !== null) this._generalVolume.set(Number(generalVolume));

    const musicVolume = localStorage.getItem(GAME_PREFIX + 'musicVolume');
    if (musicVolume !== null) this._musicVolume.set(Number(musicVolume));

    const sfxVolume = localStorage.getItem(GAME_PREFIX + 'sfxVolume');
    if (sfxVolume !== null) this._sfxVolume.set(Number(sfxVolume));

    const showCroquetita = localStorage.getItem(GAME_PREFIX + 'showCroquetita');
    if (showCroquetita !== null) this._showCroquetita.set(showCroquetita === 'true');

    const showParticles = localStorage.getItem(GAME_PREFIX + 'showParticles');
    if (showParticles !== null) this._showParticles.set(showParticles === 'true');

    const showFloatingText = localStorage.getItem(GAME_PREFIX + 'showFloatingText');
    if (showFloatingText !== null) this._showFloatingText.set(showFloatingText === 'true');
  }

  public saveToStorage() {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(GAME_PREFIX + 'generalVolume', String(this._generalVolume()));
    localStorage.setItem(GAME_PREFIX + 'musicVolume', String(this._musicVolume()));
    localStorage.setItem(GAME_PREFIX + 'sfxVolume', String(this._sfxVolume()));
    localStorage.setItem(GAME_PREFIX + 'showCroquetita', String(this._showCroquetita()));
    localStorage.setItem(GAME_PREFIX + 'showParticles', String(this._showParticles()));
    localStorage.setItem(GAME_PREFIX + 'showFloatingText', String(this._showFloatingText()));
  }

  // Reset opciones a valores por defecto
  public resetOptions() {
    this._generalVolume.set(100);
    this._musicVolume.set(100);
    this._sfxVolume.set(100);
    this._showCroquetita.set(true);
    this._showParticles.set(true);
    this._showFloatingText.set(true);
    this._generalVolume$.next(1);
    this._musicVolume$.next(1);
    this._sfxVolume$.next(1);
  }

  // helpers para que otros servicios usen el prefijo
  getGameItem(key: string): string | null {
    if (!this._localStorageAvailable) return null;
    try {
      return localStorage.getItem(GAME_PREFIX + key);
    } catch (error) {
      return null;
    }
  }

  setGameItem(key: string, value: string): void {
    if (!this._localStorageAvailable) return;
    try {
      localStorage.setItem(GAME_PREFIX + key, value);
      // notificar que un item de progreso se ha modificado
      this._gameItemsVersion.update((v) => v + 1);
    } catch (error) {
      console.warn('Error guardando en localStorage:', error);
    }
  }

  removeGameItem(key: string): void {
    if (!this._localStorageAvailable) return;
    try {
      localStorage.removeItem(GAME_PREFIX + key);
      this._gameItemsVersion.update((v) => v + 1);
    } catch (error) {
      console.warn('Error eliminando item en localStorage:', error);
    }
  }

  public isLocalStorageAvailable(): boolean {
    return this._localStorageAvailable;
  }

  public async requestPersistentStorage(): Promise<boolean> {
    if (
      typeof navigator === 'undefined' ||
      !('storage' in navigator) ||
      !(navigator as any).storage.persist
    ) {
      return false;
    }
    try {
      const persisted = await (navigator as any).storage.persist();
      if (!persisted) console.info('No se concedió persistencia');
      return persisted;
    } catch (e) {
      return false;
    }
  }
}
