import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Producer } from '@ui/producer/producer';
import { Upgrade } from '@ui/upgrade/upgrade';
import { ShopControls } from '@ui/shop-controls/shop-controls';
import { PRODUCERS } from '@data/producer.data';
import { UPGRADES } from '@data/upgrade.data';
import { ProducerModel } from '@models/producer.model';
import { ShopControlsService } from '@services/shop-controls.service';
import { PointsService } from '@services/points.service';
import { OptionsService } from '@services/options.service';
import Decimal from 'break_infinity.js';
import { Tooltip } from '@ui/tooltip/tooltip';

@Component({
  selector: 'app-upgrades',
  imports: [CommonModule, Producer, Upgrade, ShopControls, Tooltip],
  templateUrl: './upgrades.html',
  styleUrl: './upgrades.css',
})
export class Upgrades {
  upgrades = UPGRADES;
  producers = PRODUCERS;

  private optionsService = inject(OptionsService);

  constructor(public shopControls: ShopControlsService, private pointsService: PointsService) {}

  filteredAndSortedProducers = computed(() => {
    let filtered = [...this.producers];

    const buyAmount = this.shopControls.buyAmount();
    const filter = this.shopControls.filter();
    const sort = this.shopControls.sortOrder();
    const currentPoints = this.pointsService.points();

    if (filter === 'affordable') {
      // Solo los que puedes comprar
      filtered = filtered.filter((p) => {
        const price = this.calculateBulkPrice(p, this.getProducerQuantity(p.id), buyAmount);
        return currentPoints.gte(price);
      });
    }

    return filtered;
  });

  // Obtener cantidad de un productor desde localStorage
  private getProducerQuantity(id: number): number {
    if (typeof localStorage === 'undefined') return 0;
    const q = this.optionsService.getGameItem('producer_' + id + '_quantity');
    return q ? Number(q) || 0 : 0;
  }

  // Calcular precio bulk (mismo cálculo que en producer.ts)
  private calculateBulkPrice(producer: ProducerModel, currentQuantity: number, amount: number) {
    const base = new Decimal(producer.priceBase);
    const mult = new Decimal(producer.priceMult);

    if (mult.eq(1)) {
      return base.times(amount);
    }

    const multPowCurrent = mult.pow(currentQuantity);
    const multPowAmount = mult.pow(amount);
    const numerator = multPowAmount.minus(1);
    const denominator = mult.minus(1);

    const total = base.times(multPowCurrent).times(numerator).dividedBy(denominator);
    return total.floor();
  }
}
