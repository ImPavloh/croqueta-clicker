import { Component, effect, inject, Input } from '@angular/core';
import { PointsService } from '@services/points.service';
import { NgClass } from '@angular/common';
import { ShortNumberPipe } from '@pipes/short-number.pipe';
import { CornerCard } from '@ui/corner-card/corner-card';
import { Subscription } from 'rxjs';
import { PlayerStats } from '@services/player-stats.service';
import { AudioService } from '@services/audio.service';
import { ShopControlsService } from '@services/shop-controls.service';
import { OptionsService } from '@services/options.service';
import { ProducerModel } from '@models/producer.model';
import Decimal from 'break_infinity.js';

@Component({
  selector: 'app-producer',
  imports: [NgClass, ShortNumberPipe, CornerCard],
  templateUrl: './producer.html',
  styleUrl: './producer.css',
})
export class Producer {
  private playerStats = inject(PlayerStats);
  public pointsService = inject(PointsService);
  private audioService = inject(AudioService);
  public shopControls = inject(ShopControlsService);
  private optionsService = inject(OptionsService);

  // actualizar el precio cuando cambie buyAmount (se basa en la cantidad)
  inintEfect = effect(() => this.updatePriceAndPoints());

  private levelSub?: Subscription;

  // ID del productor
  @Input() config!: ProducerModel;

  // cantidad (entera)
  quantity: number = 0;
  // precio y puntos como Decimal para evitar pérdida de precisión
  price: Decimal = new Decimal(0);
  points: Decimal = new Decimal(0);
  unlocked: boolean = true;

  ngOnInit() {
    this.loadFromStorage();
    this.updatePriceAndPoints();

    if (this.quantity > 0) {
      const production = this.calculateTotalPoints();
    }

    this.levelSub = this.playerStats.level$.subscribe((level) => {
      this.checkLevel(level);
    });
  }

  // Actualizar precio y puntos cuando cambia la cantidad de compra
  updatePriceAndPoints() {
    const buyAmount = this.shopControls.buyAmount();
    this.price = this.calculateBulkPrice(this.quantity, buyAmount);
    this.points = this.calculatePoints(this.quantity);
  }

  // Comprobar si el productor está desbloqueado
  checkLevel(currentLevel: number) {
    this.unlocked = currentLevel >= this.config.level;
  }

  // calcular el precio de comprar N unidades (suma geométrica)
  // sum(i=0 to n-1) { priceBase * priceMult^(quantity+i) }
  // fuente: de los deseos
  calculateBulkPrice(currentQuantity: number, amount: number): Decimal {
    const base = new Decimal(this.config.priceBase);
    const mult = new Decimal(this.config.priceMult);

    // si el multiplicador es 1 es lineal (no cambia nada)
    if (mult.eq(1)) {
      return base.times(amount);
    }

    // suma geométrica: base * mult^currentQuantity * (mult^amount - 1) / (mult - 1)
    // TODO: revisar esto, victor todo tuyo
    const multPowCurrent = mult.pow(currentQuantity);
    const multPowAmount = mult.pow(amount);
    const numerator = multPowAmount.minus(1);
    const denominator = mult.minus(1);

    const total = base.times(multPowCurrent).times(numerator).dividedBy(denominator);
    return total.floor();
  }

  // Método para calcular el precio actual del productor (devuelve Decimal, redondeado hacia abajo)
  calculatePrice(quantity: number): Decimal {
    // price = floor(priceBase * priceMult^quantity)
    const base = new Decimal(this.config.priceBase);
    const mult = new Decimal(this.config.priceMult);
    // usar pow sobre mult
    const value = base.times(mult.pow(quantity));
    return value.floor();
  }

  // Método para calcular los puntos generados por el productor (devuelve Decimal)
  calculatePoints(quantity: number): Decimal {
    // points = pointsBase + pointsSum * quantity
    const base = new Decimal(this.config.pointsBase);
    const sum = new Decimal(this.config.pointsSum).times(quantity);
    return base.plus(sum);
  }

  // Método para calcular el total de puntos generados por todos los productores
  calculateTotalPoints(): Decimal {
    // total = points * quantity
    return this.points.times(this.quantity);
  }

  // Método para comprar el productor
  buyProducer() {
    const buyAmount = this.shopControls.buyAmount();
    const cost = this.calculateBulkPrice(this.quantity, buyAmount);

    // comparar Decimal con Decimal
    if (this.pointsService.points().gte(cost)) {
      // restar usando Decimal
      this.pointsService.substractPoints(cost);

      // calcular el cps anterior
      const oldCps = this.pointsService.pointsPerSecond();
      const oldProduction = this.calculateTotalPoints();

      this.quantity += buyAmount;

      // calcular nueva producción de este productor
      const newProduction = this.calculateTotalPoints();
      const addedProduction = newProduction.minus(oldProduction);

      // actualizar cps global
      const newCps = oldCps.plus(addedProduction);
      this.pointsService.upgradePointsPerSecond(newCps);

      // recalcular precio y puntos mostrados
      this.updatePriceAndPoints();

      this.saveToStorage();

      // añadir experiencia (multiplicada por cantidad comprada)
      this.playerStats.addExp(this.config.exp * buyAmount);

      // SFX
      this.audioService.playSfx('/assets/sfx/click02.mp3', 1);
    } else {
      // SFX error
      this.audioService.playSfx('/assets/sfx/error.mp3', 1);
    }
  }

  // persistencia simple en localStorage (quantity sigue siendo number)
  public loadFromStorage() {
    // si no hay localStorage, no hacer nada
    if (typeof localStorage === 'undefined') return;
    // cargar cantidad
    const q = this.optionsService.getGameItem('producer_' + this.config.id + '_quantity');
    if (q) this.quantity = Number(q) || 0;
  }

  public saveToStorage() {
    // si no hay localStorage, no hacer nada
    if (typeof localStorage === 'undefined') return;
    // guardar cantidad
    this.optionsService.setGameItem(
      'producer_' + this.config.id + '_quantity',
      String(this.quantity)
    );
  }

  ngOnDestroy() {
    this.levelSub?.unsubscribe(); // limpiar la suscripción
  }
}
