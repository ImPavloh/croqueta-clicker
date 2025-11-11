import { Component, computed } from '@angular/core';
import { Producer } from '@ui/producer/producer';
import { Upgrade } from '@ui/upgrade/upgrade';
import { ShopControls } from '@ui/shop-controls/shop-controls';
import { PRODUCERS } from '@data/producer.data';
import { UPGRADES } from '@data/upgrade.data';
import { ProducerModel } from '@models/producer.model';
import { ShopControlsService } from '@services/shop-controls.service';
import { PointsService } from '@services/points.service';
import Decimal from 'break_infinity.js';

@Component({
  selector: 'app-upgrades',
  imports: [Producer, Upgrade, ShopControls],
  templateUrl: './upgrades.html',
  styleUrl: './upgrades.css',
})
export class Upgrades {
  upgrades = UPGRADES;
  producers = PRODUCERS;

  constructor(private shopControls: ShopControlsService, private pointsService: PointsService) {}

  // Computed que filtra y ordena los productores según los controles
  filteredAndSortedProducers = computed(() => {
    let filtered = [...this.producers];

    // 1. Aplicar filtro
    const filter = this.shopControls.filter();
    if (filter === 'affordable') {
      // Solo los que puedes comprar
      filtered = filtered.filter((p) => {
        const buyAmount = this.shopControls.buyAmount();
        const price = this.calculateBulkPrice(p, this.getProducerQuantity(p.id), buyAmount);
        return this.pointsService.points().gte(price);
      });
    }
    // 2. Aplicar ordenación
    const sort = this.shopControls.sortOrder();
    if (sort === 'price-asc') {
      // Precio ascendente
      filtered.sort((a, b) => {
        const buyAmount = this.shopControls.buyAmount();
        const qtyA = this.getProducerQuantity(a.id);
        const qtyB = this.getProducerQuantity(b.id);
        const priceA = this.calculateBulkPrice(a, qtyA, buyAmount);
        const priceB = this.calculateBulkPrice(b, qtyB, buyAmount);
        return priceA.cmp(priceB);
      });
    } else if (sort === 'price-desc') {
      // Precio descendente
      filtered.sort((a, b) => {
        const buyAmount = this.shopControls.buyAmount();
        const qtyA = this.getProducerQuantity(a.id);
        const qtyB = this.getProducerQuantity(b.id);
        const priceA = this.calculateBulkPrice(a, qtyA, buyAmount);
        const priceB = this.calculateBulkPrice(b, qtyB, buyAmount);
        return priceB.cmp(priceA);
      });
    } else if (sort === 'name') {
      // Orden alfabético
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
    // 'default' no hace nada, mantiene el orden original

    return filtered;
  });

  // Obtener cantidad de un productor desde localStorage
  private getProducerQuantity(id: number): number {
    if (typeof localStorage === 'undefined') return 0;
    const q = localStorage.getItem('producer_' + id + '_quantity');
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
