import { Component, effect, inject, Input } from '@angular/core';
import { PointsService } from '@services/points.service';
import { ShortNumberPipe } from '@pipes/short-number.pipe';
import { ButtonComponent } from '@ui/button/button';
import { PlayerStats } from '@services/player-stats.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { AudioService } from '@services/audio.service';
import { OptionsService } from '@services/options.service';
import Decimal from 'break_infinity.js';
import { UpgradeModel } from '@models/upgrade.model';

import { TranslocoModule } from '@jsverse/transloco';

/**
 * Componente que representa una mejora de puntos por clic.
 * Muestra la información de la mejora, permite comprarla (una sola vez)
 * y gestiona su desbloqueo basado en el nivel del jugador.
 */
@Component({
  selector: 'app-upgrade',
  standalone: true,
  host: {
    class: 'upgrade',
  },
  imports: [ShortNumberPipe, ButtonComponent, TranslocoModule],
  templateUrl: './upgrade.html',
  styleUrl: './upgrade.css',
})
export class Upgrade {
  private playerStats = inject(PlayerStats);
  public pointsService = inject(PointsService);
  private audioService = inject(AudioService);
  private optionsService = inject(OptionsService);

  /** Configuración de la mejora (pasada desde el componente padre) */
  @Input() config!: UpgradeModel;

  /** Índice de la tarjeta (para estilos de animación) */
  @Input() cardIndex: number = 0;

  /** Nivel actual del jugador */
  private level = toSignal(this.playerStats.level$, { initialValue: 0 });

  /** Effect que comprueba el nivel para desbloqueo */ levelEffect = effect(() => {
    if (this.config) {
      const currentLevel = this.level();
      this.checkLevel(currentLevel);
    }
  });

  /** Indica si la mejora está desbloqueada (según nivel del jugador) */
  unlocked: boolean = true;

  /** Indica si la mejora ya ha sido comprada */
  bought: boolean = false;

  ngOnInit() {
    this.loadFromStorage();
  }

  /**
   * Comprueba si la mejora debe estar desbloqueada según el nivel actual.
   * @param currentLevel Nivel actual del jugador
   */
  checkLevel(currentLevel: number) {
    if (!this.config) return;
    this.unlocked = currentLevel >= this.config.level;
  }

  /**
   * Compra la mejora si el jugador tiene suficientes croquetas.
   * Actualiza los puntos por clic, la experiencia y marca la mejora como comprada.
   */
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
