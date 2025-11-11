import { Injectable, inject, OnDestroy } from '@angular/core';
import { PointsService } from './points.service';
import { PlayerStats } from './player-stats.service';
import { OptionsService } from './options.service';
import { PRODUCERS } from '@data/producer.data';
import { UPGRADES } from '@data/upgrade.data';

@Injectable({
  providedIn: 'root',
})
export class AutosaveService implements OnDestroy {
  private pointsService = inject(PointsService);
  private playerStats = inject(PlayerStats);
  private optionsService = inject(OptionsService);

  private intervalId?: any;
  private readonly AUTOSAVE_INTERVAL = 60000; // 1min
  private isImporting = false;

  constructor() {
    this.startAutosave();
  }

  private startAutosave() {
    if (typeof window !== 'undefined') {
      this.intervalId = setInterval(() => {
        this.saveAll();
      }, this.AUTOSAVE_INTERVAL);

      // también guardar cuando se cierra/recarga la página (a no ser que se recargue la pagina por un reseteo o carga manual de datos)
      window.addEventListener('beforeunload', this.saveAll.bind(this));
    }
  }

  private saveAll() {
    // NO guardar si estamos importando
    if (this.isImporting) {
      return;
    }

    try {
      const pointsService = this.pointsService as any;
      const playerStats = this.playerStats as any;

      // Temporalmente permitir guardado
      const wasInitializingPoints = pointsService.isInitializing;
      const wasInitializingStats = playerStats.isInitializing;

      pointsService.isInitializing = false;
      playerStats.isInitializing = false;

      this.pointsService.saveToStorage();
      this.playerStats.saveToStorage();

      // Restaurar estado
      pointsService.isInitializing = wasInitializingPoints;
      playerStats.isInitializing = wasInitializingStats;
    } catch (error) {
      console.error('Error al guardar automáticamente:', error);
    }
  }

  // guardar manualmente
  public saveManually(): boolean {
    try {
      const pointsService = this.pointsService as any;
      const playerStats = this.playerStats as any;

      const wasInitializingPoints = pointsService.isInitializing;
      const wasInitializingStats = playerStats.isInitializing;

      pointsService.isInitializing = false;
      playerStats.isInitializing = false;

      // servicios principales
      this.pointsService.saveToStorage();
      this.playerStats.saveToStorage();
      this.optionsService.saveToStorage();

      // productores (recorrer y forzar guardado)
      this.saveProducersState();

      // upgrades
      this.saveUpgradesState();

      // restaurar estado
      pointsService.isInitializing = wasInitializingPoints;
      playerStats.isInitializing = wasInitializingStats;

      return true;
    } catch (error) {
      return false;
    }
  }

  // Métodos para controlar el flag de importación
  public setImporting(value: boolean) {
    console.log('[AutosaveService] setImporting:', value);
    this.isImporting = value;
  }

  public isCurrentlyImporting(): boolean {
    return this.isImporting;
  }

  // guardar estado de todos los productores
  private saveProducersState() {
    if (typeof localStorage === 'undefined') return;

    PRODUCERS.forEach(producer => {
      const quantity = this.optionsService.getGameItem(`producer_${producer.id}_quantity`);
      if (quantity === null) {
        this.optionsService.setGameItem(`producer_${producer.id}_quantity`, '0');
      }
    });
  }

  // guardar estado de todas las mejoras
  private saveUpgradesState() {
    if (typeof localStorage === 'undefined') return;

    UPGRADES.forEach(upgrade => {
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
    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', this.saveAll.bind(this));
    }
  }
}
