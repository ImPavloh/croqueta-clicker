import { Injectable, inject, OnDestroy } from '@angular/core';
import { PointsService } from './points.service';
import { PlayerStats } from './player-stats.service';
import { OptionsService } from './options.service';
import { PRODUCERS } from '@data/producer.data';
import { UPGRADES } from '@data/upgrade.data';
import { Subject, debounceTime, Subscription } from 'rxjs';
import { Injector } from '@angular/core';
import { PrestigeService } from './prestige.service';

@Injectable({
  providedIn: 'root',
})
export class AutosaveService implements OnDestroy {
  private pointsService = inject(PointsService);
  private playerStats = inject(PlayerStats);
  private optionsService = inject(OptionsService);
  private injectorRef = inject(Injector);

  private get prestigeService(): PrestigeService {
    return this.injectorRef.get(PrestigeService);
  }

  private intervalId?: any;
  private readonly AUTOSAVE_INTERVAL = 60000; // 1min
  private isImporting = false;
  private readonly boundSaveAll = this.saveAll.bind(this);
  private readonly boundVisibilitySave = () => {
    if (document.visibilityState === 'hidden') this.saveAll();
  };

  // Debounce save logic
  private saveRequestSubject = new Subject<void>();
  private saveSubscription: Subscription;

  constructor() {
    this.startAutosave();

    // Debounce save requests to happen at most once every 5 seconds
    this.saveSubscription = this.saveRequestSubject.pipe(debounceTime(5000)).subscribe(() => {
      this.saveAll();
    });
  }

  /**
   * Solicita un guardado de datos.
   * La operación real se ejecutará después de 5 segundos de inactividad de solicitudes.
   * Útil para eventos frecuentes como clicks.
   */
  public requestSave() {
    this.saveRequestSubject.next();
  }

  private startAutosave() {
    if (typeof window !== 'undefined') {
      this.intervalId = setInterval(() => {
        // Force save every minute regardless of debounce
        this.saveAll();
      }, this.AUTOSAVE_INTERVAL);

      // también guardar cuando se cierra/recarga la página (a no ser que se recargue la pagina por un reseteo o carga manual de datos)
      window.addEventListener('beforeunload', this.boundSaveAll);
      // Safari (iOS) suele no disparar beforeunload, usar pagehide y visibilitychange
      window.addEventListener('pagehide', this.boundSaveAll);
      document.addEventListener('visibilitychange', this.boundVisibilitySave);
    }
  }

  private saveAll() {
    // NO guardar si estamos importando
    if (this.isImporting) {
      return;
    }

    try {
      // Si no hay soporte de localStorage robusto (ej. Safari privado) evitar intentar persistir datos
      if (!this.optionsService.isLocalStorageAvailable()) return;

      this.pointsService.saveToStorage();

      // PlayerStats save
      this.playerStats.saveToStorage();

      // Options save
      this.optionsService.saveToStorage();

      // Prestige save
      this.prestigeService.saveToStorage();
    } catch (error) {
      console.error('Error al guardar automáticamente:', error);
    }
  }

  // guardar manualmente
  public saveManually(): boolean {
    try {
      this.saveAll();

      // productores (recorrer y forzar guardado)
      this.saveProducersState();

      // upgrades
      this.saveUpgradesState();

      return true;
    } catch (error) {
      return false;
    }
  }

  // Métodos para controlar el flag de importación
  public setImporting(value: boolean) {
    this.isImporting = value;
  }

  public isCurrentlyImporting(): boolean {
    return this.isImporting;
  }

  // guardar estado de todos los productores
  private saveProducersState() {
    if (typeof localStorage === 'undefined') return;

    PRODUCERS.forEach((producer) => {
      const quantity = this.optionsService.getGameItem(`producer_${producer.id}_quantity`);
      if (quantity === null) {
        this.optionsService.setGameItem(`producer_${producer.id}_quantity`, '0');
      }
    });
  }

  // guardar estado de todas las mejoras
  private saveUpgradesState() {
    if (typeof localStorage === 'undefined') return;

    UPGRADES.forEach((upgrade) => {
      const bought = this.optionsService.getGameItem(`upgrade_${upgrade.id}_bought`);
      if (bought === null) {
        this.optionsService.setGameItem(`upgrade_${upgrade.id}_bought`, 'false');
      }
    });
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.saveSubscription?.unsubscribe();
    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', this.boundSaveAll);
      window.removeEventListener('pagehide', this.boundSaveAll);
      document.removeEventListener('visibilitychange', this.boundVisibilitySave);
    }
  }
}
