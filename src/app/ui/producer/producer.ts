import { Component, Input } from '@angular/core';
import { PointsService } from '../../services/points.service';
import { NgClass } from '@angular/common';
import { ShortNumberPipe } from '../../pipes/short-number.pipe';
import { CornerCard } from '../corner-card/corner-card';
import { Subscription } from 'rxjs';
import { PlayerStats } from '../../services/player-stats.service';

@Component({
  selector: 'app-producer',
  imports: [NgClass, ShortNumberPipe, CornerCard],
  templateUrl: './producer.html',
  styleUrl: './producer.css',
})
export class Producer {
  constructor(public pointsService: PointsService, public playerStats: PlayerStats) { }

  // ID del productor
  @Input() id: number = 0;
  // Nombre del productor
  @Input() name: string = '';
  // Imagen del productor
  @Input() image: string = '';
  // Costo base del productor
  @Input() priceBase: number = 1;
  // Multiplicador de costo del productor
  @Input() priceMult: number = 1.05;
  // Puntos base generados por el productor
  @Input() pointsBase: number = 3;
  // Suma de puntos generados por el productor
  @Input() pointsSum: number = 1;
  // Descripción del productor
  @Input() description: string = '';
  // Experiencia necesaria para desbloquear el productor
  @Input() level: number = 0;
  // Experiencia por comprar el productor
  @Input() exp: number = 1;

  private levelSub?: Subscription;

  quantity: number = 0;
  price: number = 0;
  points: number = 0;
  unlocked: boolean = true;

  ngOnInit() {
    this.loadFromStorage();
    this.price = this.calculatePrice(this.quantity);
    this.points = this.calculatePoints(this.quantity);
    this.levelSub = this.playerStats.level$.subscribe((level) => {
      this.checkLevel(level);
    });
  }

  // Comprobar si el productor está desbloqueado
  checkLevel(currentLevel: number) {
    this.unlocked = currentLevel >= this.level;
  }

  // Método para calcular el precio actual del productor
  calculatePrice(quantity: number): number {
    return Math.floor(this.priceBase * Math.pow(this.priceMult, quantity));
  }

  // Método para calcular los puntos generados por el productor
  calculatePoints(quantity: number): number {
    return this.pointsBase + this.pointsSum * quantity;
  }

  // Método para comprar el productor
  buyProducer() {
    console.log('Buying producer:', this.name);
    const cost = this.calculatePrice(this.quantity);
    if (this.pointsService.points() >= cost) {
      this.pointsService.substractPoints(cost);
      this.pointsService.upgradePointsPerSecond(
        this.pointsService.pointsPerSecond() + this.calculatePoints(this.quantity)
      );
      this.quantity += 1;
      this.price = this.calculatePrice(this.quantity);
      this.points = this.calculatePoints(this.quantity);
      this.saveToStorage();
      this.pointsService.saveToStorage();
      this.playerStats.addExp(this.exp);
    }
  }

  // persistencia simple en localStorage
  loadFromStorage() {
    // si no hay localStorage, no hacer nada
    if (typeof localStorage === 'undefined') return;
    // cargar puntos
    const points = localStorage.getItem('producer_' + this.id + '_quantity');
    if (points) this.quantity = Number(points) || 0;
  }

  saveToStorage() {
    // si no hay localStorage, no hacer nada
    if (typeof localStorage === 'undefined') return;
    // guardar puntos
    localStorage.setItem('producer_' + this.id + '_quantity', String(this.quantity));
  }

  ngOnDestroy() {
    this.levelSub?.unsubscribe(); // limpiar la suscripción
  }
}
