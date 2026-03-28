import { Injectable, signal, inject, Injector } from '@angular/core';
import { OptionsService } from './options.service';
import { PointsService } from './points.service';
import { PlayerStats } from './player-stats.service';
import { ShopControlsService } from './shop-controls.service';
import { AchievementsService } from './achievements.service';
import { AutosaveService } from './autosave.service';
import { PRODUCERS } from '@data/producer.data';
import { UPGRADES } from '@data/upgrade.data';
import {
  PRESTIGE_MIN_LEVEL,
  calculateGoldenCroquetas,
  calculatePrestigeMultiplier,
} from '@models/prestige.model';

@Injectable({
  providedIn: 'root',
})
export class PrestigeService {
  private optionsService = inject(OptionsService);
  private injector = inject(Injector);

  private get pointsService(): PointsService {
    return this.injector.get(PointsService);
  }
  private get playerStats(): PlayerStats {
    return this.injector.get(PlayerStats);
  }
  private get shopControlsService(): ShopControlsService {
    return this.injector.get(ShopControlsService);
  }
  private get achievementsService(): AchievementsService {
    return this.injector.get(AchievementsService);
  }
  private get autosaveService(): AutosaveService {
    return this.injector.get(AutosaveService);
  }

  private _prestigeLevel = signal<number>(0);
  private _goldenCroquetas = signal<number>(0);
  private _prestigeMultiplier = signal<number>(1);

  readonly prestigeLevel = this._prestigeLevel.asReadonly();
  readonly goldenCroquetas = this._goldenCroquetas.asReadonly();
  readonly prestigeMultiplier = this._prestigeMultiplier.asReadonly();

  constructor() {
    this.loadFromStorage();
  }

  canPrestige(): boolean {
    return this.playerStats._level.value >= PRESTIGE_MIN_LEVEL;
  }

  getPrestigePreview(): { goldenCroquetas: number; newMultiplier: number } {
    const earned = calculateGoldenCroquetas(this.playerStats._level.value, this._prestigeLevel());
    const newTotal = this._goldenCroquetas() + earned;
    return {
      goldenCroquetas: earned,
      newMultiplier: calculatePrestigeMultiplier(newTotal),
    };
  }

  performPrestige(): void {
    if (!this.canPrestige()) return;

    const earned = calculateGoldenCroquetas(this.playerStats._level.value, this._prestigeLevel());

    // Actualizar estado de prestigio
    this._prestigeLevel.update((v) => v + 1);
    this._goldenCroquetas.update((v) => v + earned);
    this._prestigeMultiplier.set(calculatePrestigeMultiplier(this._goldenCroquetas()));

    // Guardar prestigio ANTES de resetear
    this.saveToStorage();

    // Resetear progreso económico
    this.pointsService.reset();
    this.playerStats.reset();
    this.shopControlsService.reset();

    // Resetear productores y upgrades del localStorage
    this.resetProducersAndUpgrades();

    // Guardar el estado limpio
    this.autosaveService.saveManually();

    // Checks de logros de prestigio
    this.checkPrestigeAchievements();
  }

  private resetProducersAndUpgrades(): void {
    PRODUCERS.forEach((p) => {
      this.optionsService.removeGameItem(`producer_${p.id}_quantity`);
    });
    UPGRADES.forEach((u) => {
      this.optionsService.removeGameItem(`upgrade_${u.id}_bought`);
    });
  }

  private checkPrestigeAchievements(): void {
    const level = this._prestigeLevel();
    if (level >= 1) this.achievementsService.unlockAchievement('primer_prestigio');
    if (level >= 5) this.achievementsService.unlockAchievement('prestigio_5');
    if (level >= 10) this.achievementsService.unlockAchievement('prestigio_10');
    if (level >= 25) this.achievementsService.unlockAchievement('prestigio_25');
  }

  /** Reset total (borrar TODO, incluyendo prestigio para reiniciar partida) */
  reset(): void {
    this._prestigeLevel.set(0);
    this._goldenCroquetas.set(0);
    this._prestigeMultiplier.set(1);
    this.optionsService.removeGameItem('prestigeLevel');
    this.optionsService.removeGameItem('goldenCroquetas');
  }

  loadFromStorage(): void {
    const pl = this.optionsService.getGameItem('prestigeLevel');
    if (pl) this._prestigeLevel.set(Number(pl));

    const gc = this.optionsService.getGameItem('goldenCroquetas');
    if (gc) this._goldenCroquetas.set(Number(gc));

    this._prestigeMultiplier.set(calculatePrestigeMultiplier(this._goldenCroquetas()));
  }

  saveToStorage(): void {
    this.optionsService.setGameItem('prestigeLevel', String(this._prestigeLevel()));
    this.optionsService.setGameItem('goldenCroquetas', String(this._goldenCroquetas()));
  }
}
