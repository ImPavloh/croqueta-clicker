import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Producer } from '@ui/producer/producer';
import { Upgrade } from '@ui/upgrade/upgrade';
import { ShopControls } from '@ui/shop-controls/shop-controls';
import { ButtonComponent } from '@ui/button/button';
import { PRODUCERS } from '@data/producer.data';
import { UPGRADES } from '@data/upgrade.data';
import { ProducerModel } from '@models/producer.model';
import { ShopControlsService } from '@services/shop-controls.service';
import { PointsService } from '@services/points.service';
import { OptionsService } from '@services/options.service';
import Decimal from 'break_infinity.js';

import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-upgrades',
  standalone: true,
  imports: [CommonModule, Producer, Upgrade, ShopControls, TranslocoModule, ButtonComponent],
  templateUrl: './upgrades.html',
  styleUrl: './upgrades.css',
})
export class Upgrades {
  upgrades = UPGRADES;
  producers = PRODUCERS;

  public mobileTab: 'upgrades' | 'producers' = 'upgrades';

  private optionsService = inject(OptionsService);

  constructor(public shopControls: ShopControlsService, private pointsService: PointsService) {}

  // Mostrar upgrades filtrados por estado (comprados / no comprados)
  filteredUpgrades = computed(() => {
    this.optionsService.gameItemsVersion();
    const list = [...this.upgrades];
    const hideBought = this.shopControls.getShowBoughtFilter('upgrades')();
    if (!hideBought) {
      // If filter is OFF => show all upgrades
      return list;
    }
    // If true => hide bought => show only not-bought
    return list.filter((u) => {
      const bought = this.optionsService.getGameItem('upgrade_' + u.id + '_bought');
      const isBought = bought === 'true';
      return !isBought;
    });
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
