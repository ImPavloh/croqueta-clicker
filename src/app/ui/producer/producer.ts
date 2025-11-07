import { Component, Input } from '@angular/core';
import { PointsService } from '@services/points.service';
import { NgClass } from '@angular/common';
import { ShortNumberPipe } from '@pipes/short-number.pipe';
import { CornerCard } from '@ui/corner-card/corner-card';
import { Subscription } from 'rxjs';
import { PlayerStats } from '@services/player-stats.service';
import { AudioService } from '@services/audio.service';
import Decimal from 'break_infinity.js';

@Component({
  selector: 'app-producer',
  imports: [NgClass, ShortNumberPipe, CornerCard],
  templateUrl: './producer.html',
  styleUrl: './producer.css',
})
export class Producer {
  constructor(public pointsService: PointsService, public playerStats: PlayerStats, private audioService: AudioService) { }

  // ID del productor
  @Input() id: number = 0;
  // Nombre del productor
  @Input() name: string = '';
  // Imagen del productor
  @Input() image: string = '';
  // Costo base del productor (se recibe como number, se convierte a Decimal en cálculos)
  @Input() priceBase: number = 1;
  // Multiplicador de costo del productor
  @Input() priceMult: number = 1.05;
  // Puntos base generados por el productor
  @Input() pointsBase: number = 3;
  // Suma de puntos generados por el productor por unidad
  @Input() pointsSum: number = 1;
  // Descripción del productor
  @Input() description: string = '';
  // Experiencia necesaria para desbloquear el productor
  @Input() level: number = 0;
  // Experiencia por comprar el productor
  @Input() exp: number = 1;

  private levelSub?: Subscription;

  // cantidad (entera)
  quantity: number = 0;
  // precio y puntos como Decimal para evitar pérdida de precisión
  price: Decimal = new Decimal(0);
  points: Decimal = new Decimal(0);
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

  // Método para calcular el precio actual del productor (devuelve Decimal, redondeado hacia abajo)
  calculatePrice(quantity: number): Decimal {
    // price = floor(priceBase * priceMult^quantity)
    const base = new Decimal(this.priceBase);
    const mult = new Decimal(this.priceMult);
    // usar pow sobre mult
    const value = base.times(mult.pow(quantity));
    return value.floor();
  }

  // Método para calcular los puntos generados por el productor (devuelve Decimal)
  calculatePoints(quantity: number): Decimal {
    // points = pointsBase + pointsSum * quantity
    const base = new Decimal(this.pointsBase);
    const sum = new Decimal(this.pointsSum).times(quantity);
    return base.plus(sum);
  }

  // Método para comprar el productor
  buyProducer() {
    console.log('Buying producer:', this.name);
    const cost = this.calculatePrice(this.quantity);
    // comparar Decimal con Decimal
    if (this.pointsService.points().gte(cost)) {
      // restar usando Decimal
      this.pointsService.substractPoints(cost);
      // calcular nuevo CPS: puntos por segundo actuales + puntos que aporta este productor
      const added = this.calculatePoints(this.quantity);
      const newCps = this.pointsService.pointsPerSecond().plus(added);
      this.pointsService.upgradePointsPerSecond(newCps);
      // incrementar cantidad
      this.quantity += 1;
      // recalcular precio y puntos mostrados
      this.price = this.calculatePrice(this.quantity);
      this.points = this.calculatePoints(this.quantity);
      this.saveToStorage();
      this.pointsService.saveToStorage();
      this.playerStats.addExp(this.exp);
      // SFX
      this.audioService.playSfx("/assets/sfx/click02.mp3",1)
    }
    else {
      // SFX error
      this.audioService.playSfx("/assets/sfx/error.mp3",1)
    }
  }

  // persistencia simple en localStorage (quantity sigue siendo number)
  loadFromStorage() {
    // si no hay localStorage, no hacer nada
    if (typeof localStorage === 'undefined') return;
    // cargar cantidad
    const q = localStorage.getItem('producer_' + this.id + '_quantity');
    if (q) this.quantity = Number(q) || 0;
  }

  saveToStorage() {
    // si no hay localStorage, no hacer nada
    if (typeof localStorage === 'undefined') return;
    // guardar cantidad
    localStorage.setItem('producer_' + this.id + '_quantity', String(this.quantity));
  }

  ngOnDestroy() {
    this.levelSub?.unsubscribe(); // limpiar la suscripción
  }
}
