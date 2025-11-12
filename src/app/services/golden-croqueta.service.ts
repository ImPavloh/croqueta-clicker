import { Injectable, signal, effect, inject, OnDestroy } from '@angular/core';
import {
  GOLDEN_CROQUETA_BONUS_DURATION_MS,
  GOLDEN_CROQUETA_BONUS_MULTIPLIER,
  GOLDEN_CROQUETA_CHECK_INTERVAL_MS,
  GOLDEN_CROQUETA_LIFETIME_MS,
  GOLDEN_CROQUETA_SPAWN_CHANCE,
} from '../config/constants';
import { AudioService } from './audio.service';
import { AchievementsService } from './achievements.service';

export interface GoldenCroquetaState {
  visible: boolean;
  top: number;
  left: number;
  animation: 'in' | 'out' | 'none';
}

@Injectable({
  providedIn: 'root',
})
export class GoldenCroquetaService implements OnDestroy {
  private audioService = inject(AudioService);
  private achievementsService = inject(AchievementsService);

  // State for the golden croqueta itself
  private _state = signal<GoldenCroquetaState>({
    visible: false,
    top: 0,
    left: 0,
    animation: 'none',
  });
  readonly state = this._state.asReadonly();

  // State for the bonus
  private _isBonusActive = signal(false);
  readonly isBonusActive = this._isBonusActive.asReadonly();

  private _bonusTimeLeft = signal(0);
  readonly bonusTimeLeft = this._bonusTimeLeft.asReadonly();

  readonly bonusMultiplier = GOLDEN_CROQUETA_BONUS_MULTIPLIER;

  private spawnTimer: any;
  private lifetimeTimer: any;
  private bonusTimer: any;

  constructor() {
    this.startSpawnCheck();
  }

  public startSpawnCheck() {
    if (typeof window === 'undefined') return;

    this.spawnTimer = setInterval(() => {
      if (this._state().visible || this._isBonusActive()) {
        return;
      }

      if (Math.random() < GOLDEN_CROQUETA_SPAWN_CHANCE) {
        this.show();
      }
    }, GOLDEN_CROQUETA_CHECK_INTERVAL_MS);
  }

  show() {
    const { top, left } = this.getRandomPosition();
    this._state.set({ visible: true, top, left, animation: 'in' });

    this.lifetimeTimer = setTimeout(() => {
      this.hide();
    }, GOLDEN_CROQUETA_LIFETIME_MS);
  }

  hide() {
    clearTimeout(this.lifetimeTimer);
    this._state.update(s => ({ ...s, animation: 'out' }));
    setTimeout(() => {
        this._state.set({ visible: false, top: 0, left: 0, animation: 'none' });
    }, 500); // CSS animation duration
  }

  clicked() {
    if (!this._state().visible) return;

    this.hide();
    this.activateBonus();
  }

  private activateBonus() {
    this.achievementsService.unlockAchievement('bonus_event');
    this.audioService.playSfx('/assets/sfx/achievement.mp3');
    this._isBonusActive.set(true);
    this._bonusTimeLeft.set(GOLDEN_CROQUETA_BONUS_DURATION_MS / 1000);

    this.bonusTimer = setInterval(() => {
      this._bonusTimeLeft.update(t => {
        if (t <= 1) {
          clearInterval(this.bonusTimer);
          this._isBonusActive.set(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  private getRandomPosition(): { top: number; left: number } {
    // Stay within the viewport, with a margin
    const top = Math.random() * 80 + 10; // 10% to 90% of viewport height
    const left = Math.random() * 80 + 10; // 10% to 90% of viewport width
    return { top, left };
  }

  ngOnDestroy() {
    clearInterval(this.spawnTimer);
    clearTimeout(this.lifetimeTimer);
    clearInterval(this.bonusTimer);
  }
}
