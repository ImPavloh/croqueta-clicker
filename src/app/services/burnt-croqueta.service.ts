import { Injectable, signal, inject, OnDestroy } from '@angular/core';
import {
  BURNT_CROQUETA_CHECK_INTERVAL_MS,
  BURNT_CROQUETA_LIFETIME_MS,
  BURNT_CROQUETA_PENALTY_DURATION_MS,
  BURNT_CROQUETA_PENALTY_MULTIPLIER,
  BURNT_CROQUETA_SPAWN_CHANCE,
} from '../config/constants';
import { AudioService } from './audio.service';
import { AchievementsService } from './achievements.service';

export interface BurntCroquetaState {
  visible: boolean;
  top: number;
  left: number;
  animation: 'in' | 'out' | 'none';
}

@Injectable({
  providedIn: 'root',
})
export class BurntCroquetaService implements OnDestroy {
  private audioService = inject(AudioService);
  private achievementsService = inject(AchievementsService);

  private _state = signal<BurntCroquetaState>({
    visible: false,
    top: 0,
    left: 0,
    animation: 'none',
  });
  readonly state = this._state.asReadonly();

  private _isPenaltyActive = signal(false);
  readonly isPenaltyActive = this._isPenaltyActive.asReadonly();

  private _penaltyTimeLeft = signal(0);
  readonly penaltyTimeLeft = this._penaltyTimeLeft.asReadonly();

  readonly penaltyMultiplier = BURNT_CROQUETA_PENALTY_MULTIPLIER;

  private spawnTimer: any;
  private lifetimeTimer: any;
  private penaltyTimer: any;

  constructor() {
    this.startSpawnCheck();
  }

  public startSpawnCheck() {
    if (typeof window === 'undefined') return;

    this.spawnTimer = setInterval(() => {
      if (this._state().visible || this._isPenaltyActive()) return;

      if (Math.random() < BURNT_CROQUETA_SPAWN_CHANCE) {
        this.show();
      }
    }, BURNT_CROQUETA_CHECK_INTERVAL_MS);
  }

  show() {
    const { top, left } = this.getRandomPosition();
    this._state.set({ visible: true, top, left, animation: 'in' });

    this.lifetimeTimer = setTimeout(() => this.hide(), BURNT_CROQUETA_LIFETIME_MS);
  }

  hide() {
    clearTimeout(this.lifetimeTimer);
    this._state.update((s) => ({ ...s, animation: 'out' }));
    setTimeout(() => {
      this._state.set({ visible: false, top: 0, left: 0, animation: 'none' });
    }, 500);
  }

  clicked() {
    if (!this._state().visible) return;

    this.hide();
    this.activatePenalty();
  }

  private activatePenalty() {
    this.achievementsService.unlockAchievement('penalty_event');
    this.audioService.playSfx('/assets/sfx/fail.mp3');
    this._isPenaltyActive.set(true);
    this._penaltyTimeLeft.set(BURNT_CROQUETA_PENALTY_DURATION_MS / 1000);

    this.penaltyTimer = setInterval(() => {
      this._penaltyTimeLeft.update((t) => {
        if (t <= 1) {
          clearInterval(this.penaltyTimer);
          this._isPenaltyActive.set(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  private getRandomPosition(): { top: number; left: number } {
    const top = Math.random() * 80 + 10;
    const left = Math.random() * 80 + 10;
    return { top, left };
  }

  ngOnDestroy() {
    clearInterval(this.spawnTimer);
    clearTimeout(this.lifetimeTimer);
    clearInterval(this.penaltyTimer);
  }
}
