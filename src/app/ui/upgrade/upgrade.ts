import { Component, Input } from '@angular/core';
import { PointsService } from '@services/points.service';
import { NgClass } from '@angular/common';
import { ShortNumberPipe } from '@pipes/short-number.pipe';
import { CornerCard } from '@ui/corner-card/corner-card';
import { PlayerStats } from '@services/player-stats.service';
import { Subscription } from 'rxjs';
import { AudioService } from '@services/audio.service';
import Decimal from 'break_infinity.js';

@Component({
  selector: 'app-upgrade',
  imports: [NgClass, ShortNumberPipe, CornerCard],
  templateUrl: './upgrade.html',
  styleUrl: './upgrade.css',
})
export class Upgrade {
  constructor(public pointsService: PointsService, public playerStats: PlayerStats, private audioService: AudioService) {}

  // ID de la mejora
  @Input() id: number = 0;
  // Nombre de la mejora
  @Input() name: string = '';
  // Imagen de la mejora
  @Input() image: string = '';
  // Precio de la mejora (se recibe como number, usamos Decimal internamente)
  @Input() price: number = 1;
  // Clicks generados por la mejora
  @Input() clicks: number = 3;
  // Experiencia necesaria para desbloquear la mejora
  @Input() level: number = 0;
  // Experiencia por comprar la mejora
  @Input() exp: number = 1;

  private levelSub?: Subscription;

  unlocked: boolean = true;
  bought: boolean = false;

  ngOnInit() {
    this.loadFromStorage();
    this.levelSub = this.playerStats.level$.subscribe((level) => {
      this.checkLevel(level);
    });
  }

  // Comprobar si la mejora está desbloqueada
  checkLevel(currentLevel: number) {
    this.unlocked = currentLevel >= this.level;
  }

  // Método para comprar la mejora
  buyUpgrade() {
    console.log('Buying upgrade:', this.name);

    // pointsPerClick es Decimal (desde PointsService), sumamos clicks (number)
    const pointsClickDecimal: Decimal = this.pointsService.pointsPerClick().plus(this.clicks);

    // newExp = floor(pointsClick^0.8 + pointsClick / 3)
    // Usamos Decimal para evitar pérdida de precisión en el cálculo intermedio
    let newExpDecimal = pointsClickDecimal.pow(0.8).plus(pointsClickDecimal.dividedBy(3)).floor();

    // convertir a number de forma segura (si el valor es demasiado grande, capear)
    let newExp: number;
    try {
      newExp = newExpDecimal.toNumber();
      if (!isFinite(newExp) || Number.isNaN(newExp)) {
        // capear en caso de overflow
        newExp = Number.MAX_SAFE_INTEGER;
      }
    } catch {
      newExp = Number.MAX_SAFE_INTEGER;
    }

    const priceDecimal = new Decimal(this.price);

    // comprobar si hay suficientes puntos y si no está ya comprada
    if (this.pointsService.points().gte(priceDecimal) && !this.bought) {
      // restar puntos usando Decimal
      this.pointsService.substractPoints(priceDecimal);

      // actualizar puntos por click (pointsClickDecimal es Decimal)
      this.pointsService.upgradePointPerClick(pointsClickDecimal);

      // actualizar la experiencia por click (playerStats suele usar number)
      this.playerStats.upgradeExpPerClick(newExp);

      this.bought = true;
      this.saveToStorage();
      this.pointsService.saveToStorage();
      this.playerStats.addExp(this.exp);

      // SFX compra
      this.audioService.playSfx('/assets/sfx/click02.mp3', 1);
    } else {
      // SFX error
      this.audioService.playSfx('/assets/sfx/error.mp3', 1);
    }
  }

  // persistencia simple en localStorage
  loadFromStorage() {
    // si no hay localStorage, no hacer nada
    if (typeof localStorage === 'undefined') return;
    // cargar estado de compra (guardamos 'true' / 'false' como string)
    const bought = localStorage.getItem('upgrade_' + this.id + '_bought');
    if (bought !== null) this.bought = bought === 'true';
  }

  saveToStorage() {
    // si no hay localStorage, no hacer nada
    if (typeof localStorage === 'undefined') return;
    // guardar estado de compra
    localStorage.setItem('upgrade_' + this.id + '_bought', String(this.bought));
  }

  ngOnDestroy() {
    this.levelSub?.unsubscribe(); // limpiar la suscripción
  }
}
