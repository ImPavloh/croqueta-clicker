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
import { NewsLine } from '@ui/newsline/newsline';
import { Modal } from '@ui/modal/modal';
import { FloatingButtons } from '@ui/floating-buttons/floating-buttons';
import { Subscription } from 'rxjs';
import { AudioService } from '@services/audio.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    Navbar,
    Clicker,
    Counter,
    AchievementPopup,
    Particles,
    Floating,
    Croquetita,
    NewsLine,
    Modal,
    FloatingButtons,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('croqueta-clicker');

  // splash control (visible al inicio)
  protected readonly splashShown = signal(true);

  // cargar puntos al iniciar la app
  constructor(
    points: PointsService,
    private playerStats: PlayerStats,
    private audioService: AudioService,
    private achievementsService: AchievementsService
  ) {
    points.loadFromStorage();
    playerStats.loadFromStorage();
  }

  private level: number = 1;
  private levelSub?: Subscription;

  public isMobile: boolean = window.innerWidth <= 1024;

  ngOnInit(): void {
    // ocultar splash automáticamente tras 2s
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        this.splashShown.set(false);
        this.playerStats.startTimer();
      }, 5000);
    }
    this.levelSub = this.playerStats.level$.subscribe((level) => {
      let url = '/assets/ost/bechamel.mp3';
      if (level > 30) {
        url = '/assets/ost/phillipethepope.mp3';
        this.achievementsService.unlockAchievement("achievement_ost")
      } else if (level > 15) {
        url = '/assets/ost/croquetauniversity.mp3';
      }

      this.audioService.playMusic(url, true, 2);
    });
  }
  ngOnDestroy() {
    this.playerStats.stopTimer();
  }

  protected hideSplash(): void {
    this.splashShown.set(false);
  }
}
