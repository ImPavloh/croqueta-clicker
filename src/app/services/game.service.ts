import { Injectable } from '@angular/core';
import { PointsService } from './points.service';
import { PlayerStats } from './player-stats.service';
import { SkinsService } from './skins.service';
import { AchievementsService } from './achievements.service';

/**
 * Servicio de alto nivel para operaciones de debug y testing del juego.
 * Proporciona métodos para modificar el estado del juego directamente.
 */
@Injectable({
  providedIn: 'root',
})
export class GameService {
  /**
   * @param pointsService Servicio para gestionar puntos y croquetas
   * @param playerStats Servicio para gestionar estadísticas del jugador
   * @param skinsService Servicio para gestionar skins
   * @param achievementsService Servicio para gestionar logros
   */
  constructor(
    private pointsService: PointsService,
    private playerStats: PlayerStats,
    private skinsService: SkinsService,
    private achievementsService: AchievementsService
  ) {}

  /**
   * Establece directamente la cantidad de croquetas.
   * @param amount Nueva cantidad de croquetas
   */
  setCroquetas(amount: number): void {
    this.pointsService.setPoints(amount);
  }

  /**
   * Establece directamente los croquetas por segundo.
   * @param amount Nuevos croquetas por segundo
   */
  setCps(amount: number): void {
    this.pointsService.setCps(amount);
  }

  /**
   * Desbloquea todas las skins del juego.
   */
  unlockAllSkins(): void {
    this.skinsService.unlockAllSkins();
  }

  /**
   * Desbloquea todos los logros del juego.
   */
  unlockAllAchievements(): void {
    this.achievementsService.unlockAllAchievements();
  }

  /**
   * Reinicia completamente el estado del juego.
   */
  resetGame(): void {
    this.pointsService.reset();
    this.playerStats.reset();
    this.skinsService.reset();
    this.achievementsService.resetAll();
  }
}
