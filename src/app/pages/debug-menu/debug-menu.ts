import { Component, inject } from '@angular/core';
import { GameService } from '../../services/game.service';
import { FormsModule } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { Card } from '../../ui/card/card';
import { ButtonComponent } from '../../ui/button/button';
import { CommonModule } from '@angular/common';
import { InputComponent } from '@ui/input/input';
import { PointsService } from '../../services/points.service';
import { PlayerStats } from '../../services/player-stats.service';

@Component({
  selector: 'app-debug-menu',
  templateUrl: './debug-menu.html',
  styleUrls: ['./debug-menu.css'],
  standalone: true,
  imports: [FormsModule, TranslocoModule, Card, ButtonComponent, CommonModule, InputComponent],
})
export class DebugMenuComponent {
  croquetas: number = 0;
  exp: number = 0;
  cps: number = 0;
  cpc: number = 0;

  private gameService = inject(GameService);
  private pointsService = inject(PointsService);
  private playerStats = inject(PlayerStats);


  setCroquetas() {
    this.pointsService.setPoints(this.croquetas);
  }

  setExp() {
    this.playerStats.setExp(this.exp);
  }

  setCps() {
    this.pointsService.setCps(this.cps);
  }

  setCpc() {
    this.pointsService.setPointsPerClick(this.cpc);
  }

  unlockAllSkins(): void {
    this.gameService.unlockAllSkins();
  }

  unlockAllAchievements(): void {
    this.gameService.unlockAllAchievements();
  }

  resetGame(): void {
    this.gameService.resetGame();
  }
}
