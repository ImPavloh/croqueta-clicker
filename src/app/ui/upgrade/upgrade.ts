import { Component, Input } from '@angular/core';
import { PointsService } from '../../services/points.service';
import { NgClass } from '@angular/common';
import { ShortNumberPipe } from '../../pipes/short-number.pipe';
import { CornerCard } from '../corner-card/corner-card';
import { PlayerStats } from '../../services/player-stats.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-upgrade',
  imports: [NgClass, ShortNumberPipe, CornerCard],
  templateUrl: './upgrade.html',
  styleUrl: './upgrade.css',
})
export class Upgrade {
  constructor(public pointsService: PointsService, public playerStats: PlayerStats) {}

  // ID de la mejora
  @Input() id: number = 0;
  // Nombre de la mejora
  @Input() name: string = '';
  // Imagen de la mejora
  @Input() image: string = '';
  // Precio de la mejora
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
    if (this.pointsService.points() >= this.price && !this.bought) {
      this.pointsService.substractPoints(this.price);
      this.pointsService.upgradePointPerClick(this.pointsService.pointsPerClick() + this.clicks);
      this.bought = true;
      this.saveToStorage();
      this.pointsService.saveToStorage();
      this.playerStats.addExp(this.exp);
    }
  }

  // persistencia simple en localStorage
  loadFromStorage() {
    // si no hay localStorage, no hacer nada
    if (typeof localStorage === 'undefined') return;
    // cargar estado de compra
    const bought = localStorage.getItem('upgrade_' + this.id + '_bought');
    if (bought) this.bought = Boolean(bought) || false;
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
