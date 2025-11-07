import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Navbar } from '@ui/navbar/navbar';
import { Clicker } from '@ui/clicker/clicker';
import { Counter } from '@ui/counter/counter';
import { Particles } from '@ui/particles/particles';
import { PointsService } from '@services/points.service';
import { PlayerStats } from '@services/player-stats.service';
import { AchievementPopup } from '@ui/achievement-popup/achievement-popup';
import { NewsLine } from '@ui/newsline/newsline';
import { Modal } from '@ui/modal/modal';
import { FloatingButtons } from '@ui/floating-buttons/floating-buttons';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    Navbar,
    Clicker,
    Counter,
    AchievementPopup,
    Particles,
    NewsLine,
    Modal,
    FloatingButtons,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('croqueta-clicker');

  // splash control (visible al inicio)
  protected readonly splashShown = signal(true);

  // cargar puntos al iniciar la app
  constructor(points: PointsService, private playerStats: PlayerStats) {
    points.loadFromStorage();
    playerStats.loadFromStorage();
  }

  public isMobile: boolean = window.innerWidth <= 1024;

  ngOnInit(): void {
    // ocultar splash automáticamente tras 2s
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        this.splashShown.set(false);
        this.playerStats.startTimer();
      }, 5000);
    }
  }
  ngOnDestroy() {
    this.playerStats.stopTimer();
  }

  protected hideSplash(): void {
    this.splashShown.set(false);
  }
}
