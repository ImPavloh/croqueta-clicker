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
   //Valor para establecer el número de croquetas.
  croquetas: number = 0;
  //Valor para establecer la experiencia.
  exp: number = 0;
  //Valor para establecer las croquetas por segundo.
  cps: number = 0;
  //Valor para establecer las croquetas por click.
  cpc: number = 0;

  //Servicio para gestionar el estado general del juego.
  private gameService = inject(GameService);
  //Servicio para gestionar los puntos (croquetas).
  private pointsService = inject(PointsService);
  //Servicio para gestionar las estadísticas del jugador.
  private playerStats = inject(PlayerStats);

  /**
   * Establece el número total de croquetas al valor de la propiedad `croquetas`.
   */
  setCroquetas() {
    this.pointsService.setPoints(this.croquetas);
  }

  /**
   * Establece la experiencia total del jugador al valor de la propiedad `exp`.
   */
  setExp() {
    this.playerStats.setExp(this.exp);
  }

  /**
   * Establece el número de croquetas por segundo (CPS) al valor de la propiedad `cps`.
   */
  setCps() {
    this.pointsService.setCps(this.cps);
  }

  /**
   * Establece el número de croquetas por click (CPC) al valor de la propiedad `cpc`.
   */
  setCpc() {
    this.pointsService.setPointsPerClick(this.cpc);
  }

  /**
   * Desbloquea todas las skins del juego a través del `GameService`.
   */
  unlockAllSkins(): void {
    this.gameService.unlockAllSkins();
  }

  /**
   * Desbloquea todos los logros del juego a través del `GameService`.
   */
  unlockAllAchievements(): void {
    this.gameService.unlockAllAchievements();
  }

  /**
   * Reinicia todo el progreso del juego a través del `GameService`.
   */
  resetGame(): void {
    this.gameService.resetGame();
  }
}
