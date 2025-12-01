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
/**
 * Componente de la página de mejoras y productores.
 * Muestra la tienda con productores automáticos y mejoras de clic.
 * Incluye controles de filtrado, ordenamiento y compra en cantidad.
 */
export class Upgrades {
  /** Array con la lista completa de todas las mejoras disponibles en el juego */
  upgrades = UPGRADES;

  //Array con la lista completa de todos los productores disponibles en el juego.
  producers = PRODUCERS;

  //Controla la pestaña activa en la vista móvil, que puede ser 'upgrades' o 'producers'.
  public mobileTab: 'upgrades' | 'producers' = 'upgrades';

  //Servicio para gestionar las opciones y el estado guardado del juego.
  private optionsService = inject(OptionsService);

  /**
   * @param shopControls Servicio para gestionar los controles de la tienda, como los filtros.
   */
  constructor(public shopControls: ShopControlsService) {}

  /**
   * Señal computada que devuelve una lista de mejoras filtrada.
   * Si el filtro 'Ocultar comprados' está activo, solo muestra las mejoras no compradas.
   * Reacciona a los cambios en el filtro y en los datos del juego.
   */
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
