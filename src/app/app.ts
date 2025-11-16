import { AchievementsService } from '@services/achievements.service';
import { Component, signal, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Navbar } from '@ui/navbar/navbar';
import { Clicker } from '@ui/clicker/clicker';
import { Counter } from '@ui/counter/counter';
import { Particles } from '@ui/particles/particles';
import { Floating } from '@ui/floating/floating';
import { Croquetita } from '@ui/croquetita/croquetita';
import { PointsService } from '@services/points.service';
import { PlayerStats } from '@services/player-stats.service';
import { AchievementPopup } from '@ui/achievement-popup/achievement-popup';
import { LevelUpPopup } from '@ui/level-up-popup/level-up-popup';
import { NewsLine } from '@ui/newsline/newsline';
import { Modal } from '@ui/modal/modal';
import { FloatingButtons } from '@ui/floating-buttons/floating-buttons';
import { Subscription } from 'rxjs';
import { AudioService } from '@services/audio.service';
import { AutosaveService } from '@services/autosave.service';
import { GoldenCroquetaService } from '@services/golden-croqueta.service';
import { GoldenCroqueta } from '@ui/golden-croqueta/golden-croqueta';
import { BonusCountdownPopup } from '@ui/bonus-countdown-popup/bonus-countdown-popup';
import { Splash } from '@ui/splash/splash';
import { MobileStats } from '@ui/mobile-stats/mobile-stats';
import { SkinUnlockPopup } from '@ui/skin-unlock-popup/skin-unlock-popup';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    Navbar,
    Clicker,
    Counter,
    AchievementPopup,
    LevelUpPopup,
    Particles,
    Floating,
    Croquetita,
    NewsLine,
    Modal,
    FloatingButtons,
    GoldenCroqueta,
    BonusCountdownPopup,
    Splash,
    MobileStats,
    SkinUnlockPopup,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('croqueta-clicker');

  constructor(
    private points: PointsService,
    private playerStats: PlayerStats,
    private audioService: AudioService,
    private autosaveService: AutosaveService,
    private achievementsService: AchievementsService,
    private goldenCroquetaService: GoldenCroquetaService
  ) {}

  private level: number = 1;
  private levelSub?: Subscription;

  public isMobile: boolean = window.innerWidth <= 1344;

  ngOnInit(): void {
    this.levelSub = this.playerStats.level$.subscribe((level) => {
      let url = '/assets/ost/bechamel.mp3';
      if (level > 100) {
        url = '/assets/ost/phillipethepope.mp3';
        this.achievementsService.unlockAchievement('achievement_ost');
      } else if (level > 5) {
        url = '/assets/ost/croquetauniversity.mp3';
      }

      this.audioService.playMusic(url, true, 2);
    });
    this.goldenCroquetaService.startSpawnCheck();
  }
  ngOnDestroy() {
    this.levelSub?.unsubscribe();
    this.playerStats.stopTimer();
  }

  protected onSplashComplete(): void {
    this.playerStats.startTimer();
  }
}
