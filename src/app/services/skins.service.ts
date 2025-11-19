import { Injectable, inject, effect } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AchievementsService } from './achievements.service';
import { OptionsService } from './options.service';
import { PlayerStats } from './player-stats.service';
import { PointsService } from './points.service';
import { SkinModel, UnlockRequirement } from '@models/skin.model';
import { SKINS } from '@data/skin.data';
import { TranslocoService } from '@ngneat/transloco';

export interface SkinUnlockNotification {
  skin: SkinModel;
  timestamp: number;
}

@Injectable({
  providedIn: 'root',
})
export class SkinsService {
  private optionsService = inject(OptionsService);
  private playerStats = inject(PlayerStats);
  private pointsService = inject(PointsService);
  private translocoService = inject(TranslocoService);
  // state
  private _skinId = new BehaviorSubject<number>(1);
  // getter público (read-only signal)
  skinChanged$ = this._skinId.asObservable();

  // observable para el fondo activo
  private _currentBackground = new BehaviorSubject<string>('/assets/backgrounds/bg.webp');
  currentBackground$ = this._currentBackground.asObservable();

  // skins probadas
  skinsUsed = new Set<number>();

  // skins desbloqueadas (tracking para notis)
  private unlockedSkins = new Set<number>();

  private queueSubject = new BehaviorSubject<SkinUnlockNotification[]>([]);
  readonly queue$: Observable<SkinUnlockNotification[]> = this.queueSubject.asObservable();

  constructor(private achievementsService: AchievementsService) {
    this.loadFromStorage();

    // tracking de skins desbloqueadas
    SKINS.forEach((skin) => {
      if (this.isSkinUnlocked(skin)) {
        this.unlockedSkins.add(skin.id);
      }
    });

    this.playerStats.level$.subscribe(() => {
      this.checkUnlockedSkins();
    });

    effect(() => {
      this.pointsService.points();
      this.playerStats.currentExp();
      this.checkUnlockedSkins();
    });

    this.achievementsService.unlockedMap$.subscribe(() => {
      this.checkUnlockedSkins();
    });
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
        return this.translocoService.translate('skins.unlock.unlocked');
      case 'level':
        return this.translocoService.translate('skins.unlock.level', { value: requirement.value });
      case 'croquetas':
        return this.translocoService.translate('skins.unlock.croquettes', { value: this.formatNumber(requirement.value) });
      case 'exp':
        return this.translocoService.translate('skins.unlock.exp', { value: this.formatNumber(requirement.value) });
      case 'achievement':
        return this.translocoService.translate('skins.unlock.achievement', { id: requirement.id });
      default:
        return this.translocoService.translate('skins.unlock.locked');
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
    this.updateBackground(id);
    this.checkAchievements();
    this.saveToStorage();
  }

  removeSkinFromQueue(skinId: number) {
    const currentQueue = this.queueSubject.value; // O como llames a tu BehaviorSubject
    const updatedQueue = currentQueue.filter(item => item.skin.id !== skinId);
    this.queueSubject.next(updatedQueue); // Al hacer .next(), Angular avisa al componente de nuevo
  }
  // actualizar fondo segun skin
  private updateBackground(skinId: number) {
    const skin = SKINS.find(s => s.id === skinId);
    if (skin?.background) {
      this._currentBackground.next(skin.background);
    } else {
      this._currentBackground.next('/assets/backgrounds/bg.webp');
    }
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
    if (skin) {
      const skinId = Number(skin) || 1;
      this._skinId.next(skinId);
      this.updateBackground(skinId);
    }

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
    this._currentBackground.next('/assets/backgrounds/bg.webp');
    this.skinsUsed.clear();
    this.unlockedSkins.clear();
    this.unlockedSkins.add(1); // la skin 1 siempre esta desbloqueada
  }

  public checkUnlockedSkins(): void {
    SKINS.forEach((skin) => {
      if (!this.unlockedSkins.has(skin.id) && this.isSkinUnlocked(skin)) {
        this.unlockedSkins.add(skin.id);
        this.notifySkinUnlock(skin);
      }
    });
  }

  notifySkinUnlock(skin: SkinModel): void {
    const notification: SkinUnlockNotification = {
      skin,
      timestamp: Date.now(),
    };

    const queue = this.queueSubject.getValue();
    const exists = queue.some(
      (n) => n.skin.id === skin.id && Date.now() - n.timestamp < 5000
    );
    if (!exists) {
      this.queueSubject.next([...queue, notification]);
    }
  }

  consumeNext(): SkinUnlockNotification | null {
    const queue = this.queueSubject.getValue();
    if (queue.length === 0) return null;

    const [first, ...rest] = queue;
    this.queueSubject.next(rest);
    return first;
  }
}
