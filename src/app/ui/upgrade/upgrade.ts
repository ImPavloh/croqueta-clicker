import { Component, effect, inject, Input } from '@angular/core';
import { PointsService } from '@services/points.service';
import { NgClass } from '@angular/common';
import { ShortNumberPipe } from '@pipes/short-number.pipe';
import { ButtonComponent } from '@ui/button/button';
import { PlayerStats } from '@services/player-stats.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { AudioService } from '@services/audio.service';
import { OptionsService } from '@services/options.service';
import Decimal from 'break_infinity.js';
import { UpgradeModel } from '@models/upgrade.model';

@Component({
  selector: 'app-upgrade',
  standalone: true,
  host: {
    class: 'upgrade',
  },
  imports: [NgClass, ShortNumberPipe, ButtonComponent],
  templateUrl: './upgrade.html',
  styleUrl: './upgrade.css',
})
export class Upgrade {
  private playerStats = inject(PlayerStats);
  public pointsService = inject(PointsService);
  private audioService = inject(AudioService);
  private optionsService = inject(OptionsService);

  @Input() config!: UpgradeModel;
  @Input() cardIndex: number = 0;

  private level = toSignal(this.playerStats.level$, { initialValue: 0 });

  levelEffect = effect(() => {
    if (this.config) {
      const currentLevel = this.level();
      this.checkLevel(currentLevel);
    }
  });

  unlocked: boolean = true;
  bought: boolean = false;

  ngOnInit() {
    this.loadFromStorage();
  }

  // comprobar si la mejora está desbloqueada
  checkLevel(currentLevel: number) {
    if (!this.config) return;
    this.unlocked = currentLevel >= this.config.level;
  }

  // Método para comprar la mejora
  buyUpgrade() {
    // pointsPerClick es Decimal (desde PointsService), sumamos clicks (number)
    const pointsClickDecimal: Decimal = this.pointsService
      .pointsPerClick()
      .plus(this.config.clicks);

    // newExp = floor(pointsClick^0.8 + pointsClick / 3)
    // Usamos Decimal para evitar pérdida de precisión en el cálculo intermedio

    const priceDecimal = new Decimal(this.config.price);

    // comprobar si hay suficientes puntos, si no está ya comprada y si está desbloqueada
    if (this.pointsService.points().gte(priceDecimal) && !this.bought && this.unlocked) {
      // restar puntos usando Decimal
      this.pointsService.substractPoints(priceDecimal);

      // actualizar puntos por click (pointsClickDecimal es Decimal)
      this.pointsService.upgradePointPerClick(pointsClickDecimal);

      this.playerStats.upgradeExpPerClick(pointsClickDecimal);

      this.bought = true;
      this.saveToStorage();
      this.playerStats.addExp(this.config.exp);

      // SFX compra
      this.audioService.playSfx('/assets/sfx/click02.mp3', 1);
    } else {
      // SFX error
      this.audioService.playSfx('/assets/sfx/error.mp3', 1);
    }
  }

  // persistencia simple en localStorage
  public loadFromStorage() {
    // si no hay localStorage, no hacer nada
    if (typeof localStorage === 'undefined') return;
    // cargar estado de compra (guardamos 'true' / 'false' como string)
    const bought = this.optionsService.getGameItem('upgrade_' + this.config.id + '_bought');
    if (bought !== null) this.bought = bought === 'true';
  }

  public saveToStorage() {
    // si no hay localStorage, no hacer nada
    if (typeof localStorage === 'undefined') return;
    // guardar estado de compra
    this.optionsService.setGameItem('upgrade_' + this.config.id + '_bought', String(this.bought));
  }
}
