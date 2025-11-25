import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Producer } from '@ui/producer/producer';
import { Upgrade } from '@ui/upgrade/upgrade';
import { ShopControls } from '@ui/shop-controls/shop-controls';
import { ButtonComponent } from '@ui/button/button';
import { PRODUCERS } from '@data/producer.data';
import { UPGRADES } from '@data/upgrade.data';
import { ShopControlsService } from '@services/shop-controls.service';
import { OptionsService } from '@services/options.service';

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

  constructor(public shopControls: ShopControlsService) {}

  // Mostrar upgrades filtrados por estado (comprados / no comprados)
  filteredUpgrades = computed(() => {
    this.optionsService.gameItemsVersion();
    const list = [...this.upgrades];
    const hideBought = this.shopControls.getShowBoughtFilter('upgrades')();
    if (!hideBought) {
      return list;
    }
    return list.filter((u) => {
      const bought = this.optionsService.getGameItem('upgrade_' + u.id + '_bought');
      const isBought = bought === 'true';
      return !isBought;
    });
  });
}
