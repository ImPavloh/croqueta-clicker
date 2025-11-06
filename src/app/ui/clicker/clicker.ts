import { PlayerStats } from '@services/player-stats.service';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PointsService } from '@services/points.service';
import { Floating } from '../floating/floating';
import { SkinsService } from '@services/skins.service';
import { ShortNumberPipe } from '@pipes/short-number.pipe';
import { Subscription } from 'rxjs';
import { AchievementsService } from '@services/achievements.service';

@Component({
  selector: 'app-clicker',
  imports: [CommonModule, Floating, ShortNumberPipe],
  templateUrl: './clicker.html',
  styleUrl: './clicker.css',
})
export class Clicker {
  croquetaClass = '';
  private skinSub?: Subscription;
  private afkTimeout?: any;
  private readonly afkDelay = 5000;

  constructor(
    public pointsService: PointsService,
    private skinsService: SkinsService,
    public playerStats: PlayerStats,
    private achievementsService: AchievementsService
  ) {}

  onClick() {
    this.pointsService.addPointsPerClick();
    this.playerStats.addClick();
    this.playerStats.checkLevelUp();
    // guardar puntos tras cada click
    this.pointsService.saveToStorage();
    this.playerStats.saveToStorage();
    this.resetAfkTimer();
    this.checkAchievements();
  }

  checkAchievements() {
    if (this.pointsService.points() >= 1) {
      this.achievementsService.unlockAchievement('primera_croqueta');
    }
    if (this.pointsService.points() >= 100) {
      this.achievementsService.unlockAchievement('100_croquetas');
    }
  }

  ngOnInit() {
    // suscribirse a los cambios del skin
    this.skinSub = this.skinsService.skinChanged$.subscribe((id) => {
      this.updateCroquetaStyle(id);
    });

    // inicializar con el valor actual
    this.updateCroquetaStyle(this.skinsService.skinId());
    this.startAfkTimer();
  }

  preventKey(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  updateCroquetaStyle(id: number) {
    switch (id) {
      case 1:
        this.croquetaClass = 'croqueta-normal';
        break;
      case 2:
        this.croquetaClass = 'croqueta-jamon';
        break;
      case 3:
        this.croquetaClass = 'croqueta-pollo';
        break;
      case 4:
        this.croquetaClass = 'croqueta-queso';
        break;
      case 5:
        this.croquetaClass = 'croqueta-bacalao';
        break;
      case 6:
        this.croquetaClass = 'croqueta-setas';
        break;
      case 7:
        this.croquetaClass = 'croqueta-dorada';
        break;
      default:
        this.croquetaClass = 'croqueta-normal';
        break;
    }
  }

  startAfkTimer() {
    this.afkTimeout = setTimeout(() => {
      this.croquetaClass += ' afk';
    }, this.afkDelay);
  }

  resetAfkTimer() {
    clearTimeout(this.afkTimeout);
    this.croquetaClass = this.croquetaClass.replace(' afk', '');
    this.startAfkTimer();
  }

  ngOnDestroy() {
    this.skinSub?.unsubscribe(); // limpiar la suscripción
    clearTimeout(this.afkTimeout);
  }
}
