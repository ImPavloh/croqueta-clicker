import { AchievementsService } from '@services/achievements.service';
import {
  Component,
  signal,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  Renderer2,
  inject,
} from '@angular/core';
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
import { Splash } from '@ui/splash/splash';
import { StatsComponent } from '@ui/stats/stats';
import { SkinUnlockPopup } from '@ui/skin-unlock-popup/skin-unlock-popup';
import { SkinsService } from '@services/skins.service';

@Component({
  selector: 'app-root',
  standalone: true,
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

    Splash,
    StatsComponent,
    SkinUnlockPopup,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('croqueta-clicker');
  private renderer = inject(Renderer2);

  constructor(
    private points: PointsService,
    private playerStats: PlayerStats,
    private audioService: AudioService,
    private autosaveService: AutosaveService,
    private achievementsService: AchievementsService,
    private goldenCroquetaService: GoldenCroquetaService,
    private skinsService: SkinsService
  ) {}

  private level: number = 1;
  private levelSub?: Subscription;
  private backgroundSub?: Subscription;

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

    // suscripcion al fondo activo y aplicarlo
    this.backgroundSub = this.skinsService.currentBackground$.subscribe((bgUrl) => {
      if (typeof document !== 'undefined') {
        this.renderer.setStyle(
          document.body,
          'background',
          `url('${bgUrl}') no-repeat center/cover`
        );
      }
    });
  }
  ngOnDestroy() {
    this.levelSub?.unsubscribe();
    this.backgroundSub?.unsubscribe();
    this.playerStats.stopTimer();
  }

  protected onSplashComplete(): void {
    this.playerStats.startTimer();
  }
}
