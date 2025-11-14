import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AchievementsService } from './achievements.service';
import { OptionsService } from './options.service';
import { PlayerStats } from './player-stats.service';
import { PointsService } from './points.service';
import { SkinModel, UnlockRequirement } from '@models/skin.model';
import Decimal from 'break_infinity.js';

@Injectable({
  providedIn: 'root',
})
export class SkinsService {
  private optionsService = inject(OptionsService);
  private playerStats = inject(PlayerStats);
  private pointsService = inject(PointsService);
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

  // ver si una skin esta desbloqueada
  isSkinUnlocked(skin: SkinModel): boolean {
    if (!skin.unlockRequirement || skin.unlockRequirement.type === 'none') {
      return true;
    }

    const req = skin.unlockRequirement;

    switch (req.type) {
      case 'level':
        return this.playerStats._level.value >= req.value;

      case 'croquetas':
        const totalCroquetas = this.pointsService.points();
        return totalCroquetas.gte(req.value);

      case 'exp':
        return this.playerStats.currentExp() >= req.value;

      case 'achievement':
        const achievements = this.achievementsService.getAllWithState();
        const achievement = achievements.find((a) => a.id === req.id);
        return achievement?.unlocked ?? false;

      default:
        return false;
    }
  }

  // descripción del requisito de desbloqueo
  getUnlockRequirementText(requirement: UnlockRequirement): string {
    switch (requirement.type) {
      case 'none':
        return 'Desbloqueada';
      case 'level':
        return `Nivel ${requirement.value}`;
      case 'croquetas':
        return `${this.formatNumber(requirement.value)} croquetas`;
      case 'exp':
        return `${this.formatNumber(requirement.value)} EXP`;
      case 'achievement':
        return `Logro: ${requirement.id}`;
      default:
        return 'Bloqueada';
    }
  }

  private formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
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
