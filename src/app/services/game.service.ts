import { Injectable } from '@angular/core';
import { PointsService } from './points.service';
import { PlayerStats } from './player-stats.service';
import { SkinsService } from './skins.service';
import { AchievementsService } from './achievements.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(
    private pointsService: PointsService,
    private playerStats: PlayerStats,
    private skinsService: SkinsService,
    private achievementsService: AchievementsService
  ) { }

  setCroquetas(amount: number): void {
    this.pointsService.setPoints(amount);
  }

  setCps(amount: number): void {
    this.pointsService.setCps(amount);
  }

  unlockAllSkins(): void {
    this.skinsService.unlockAllSkins();
  }

  unlockAllAchievements(): void {
    this.achievementsService.unlockAllAchievements();
  }

  resetGame(): void {
    this.pointsService.reset();
    this.playerStats.reset();
    this.skinsService.reset();
    this.achievementsService.resetAll();
  }
}
