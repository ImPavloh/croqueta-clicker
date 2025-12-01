import { Component, effect, inject, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PointsService } from '@services/points.service';
import { NgClass } from '@angular/common';
import { ShortNumberPipe } from '@pipes/short-number.pipe';
import { ButtonComponent } from '@ui/button/button';
import { PlayerStats } from '@services/player-stats.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { AudioService } from '@services/audio.service';
import { ShopControlsService } from '@services/shop-controls.service';
import { OptionsService } from '@services/options.service';
import { ProducerModel } from '@models/producer.model';
import Decimal from 'break_infinity.js';

import { TranslocoModule } from '@jsverse/transloco';

/**
 * Componente que representa un productor de croquetas automático.
 * Muestra la información del productor, permite comprarlo y gestiona
 * su desbloqueo basado en el nivel del jugador.
 */
@Component({
  selector: 'app-producer',
  standalone: true,
  imports: [CommonModule, NgClass, ShortNumberPipe, ButtonComponent, TranslocoModule],
  templateUrl: './producer.html',
  styleUrl: './producer.css',
})
export class Producer {
  private playerStats = inject(PlayerStats);
  public pointsService = inject(PointsService);
  private audioService = inject(AudioService);
  public shopControls = inject(ShopControlsService);
  private optionsService = inject(OptionsService);

  /** Configuración del productor (pasada desde el componente padre) */
  @Input() config!: ProducerModel;

  // actualizar el precio cuando cambie buyAmount (se basa en la cantidad)
  inintEfect = effect(() => {
    if (this.config) {
      this.updatePriceAndPoints();
    }
  });

  /** Nivel actual del jugador */
  public level = toSignal(this.playerStats.level$, { initialValue: 0 });

  /** Experiencia actual del jugador */
  currentExp = computed(() => this.playerStats.currentExp());

  /** Experiencia necesaria para el siguiente nivel */
  expToNext = computed(() => this.playerStats.expToNext());

  /**
   * Progreso hacia el nivel requerido para desbloquear este productor (en %).
   * Calcula el progreso considerando niveles completos y fracción del nivel actual.
   */
  levelProgressPercent = computed(() => {
    if (!this.config) return 0;
    const target = Number(this.config.level) || 0;
    if (target <= 0) return 100;

    const currentLevel = this.level();
    if (currentLevel >= target) return 100;

    const curExp = Number(this.currentExp() || 0);
    const nextExp = Number(this.expToNext() || 0);

    const fractionInLevel = nextExp > 0 ? curExp / nextExp : 0;
    const fractionalLevels = currentLevel + fractionInLevel;

    const percent = (fractionalLevels / target) * 100;
    return Math.max(0, Math.min(100, percent));
  });

  levelEffect = effect(() => {
    if (this.config) {
      const currentLevel = this.level();
      this.checkLevel(currentLevel);
    }
  });

  /** Cantidad de este productor que posee el jugador */
  quantity: number = 0;

  /** Precio actual del productor (Decimal para manejar números grandes) */
  price: Decimal = new Decimal(0);

  /** Croquetas por segundo que genera este productor */
  points: Decimal = new Decimal(0);

  /** Indica si el productor está desbloqueado (según nivel del jugador) */
  unlocked: boolean = true;

  ngOnInit() {
    this.loadFromStorage();
    this.updatePriceAndPoints();
  }

  // Actualizar precio y puntos cuando cambia la cantidad de compra
  updatePriceAndPoints() {
    const buyAmount = this.shopControls.buyAmount();
    this.price = this.calculateBulkPrice(this.quantity, buyAmount);
    this.points = this.calculatePoints(this.quantity);
  }

  // Comprobar si el productor está desbloqueado
  checkLevel(currentLevel: number) {
    if (!this.config) return; // Doble seguridad
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

  // Método para calcular los puntos por segundo que genera cada unidad individual
  calculatePoints(quantity: number): Decimal {
    if (quantity === 0) return new Decimal(0);
    // CPS por unidad = pointsBase + (pointsSum * (quantity - 1))
    // Cada unidad genera pointsBase, más un bonus por cada unidad YA comprada anteriormente
    const base = new Decimal(this.config.pointsBase);
    const bonus = new Decimal(this.config.pointsSum).times(Math.max(0, quantity - 1));
    return base.plus(bonus);
  }

  // Método para calcular el total de puntos generados por TODAS las unidades
  calculateTotalPoints(): Decimal {
    if (this.quantity === 0) return new Decimal(0);
    // Total = (pointsBase * quantity) + (pointsSum * quantity * (quantity - 1) / 2)
    // Esto es la suma: pointsBase*q + pointsSum*(0+1+2+...+(q-1))
    const base = new Decimal(this.config.pointsBase).times(this.quantity);
    const sumSequence = (this.quantity * (this.quantity - 1)) / 2;
    const bonus = new Decimal(this.config.pointsSum).times(sumSequence);
    return base.plus(bonus);
  }

  // Método para comprar el productor
  buyProducer() {
    const buyAmount = this.shopControls.buyAmount();
    const cost = this.calculateBulkPrice(this.quantity, buyAmount);

    // comparar Decimal con Decimal y verificar que esté desbloqueado
    if (this.pointsService.points().gte(cost) && this.unlocked) {
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
}
