import { Component, Input } from '@angular/core';
import { ShopControlsService, BuyAmount } from '@services/shop-controls.service';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '@ui/button/button';

import { TranslocoModule } from '@jsverse/transloco';
import { DynamicControls } from '@ui/dynamic-controls/dynamic-controls';
import { INTERFACE_SHOP } from '@data/ui-controls.data';

@Component({
  selector: 'app-shop-controls',
  standalone: true,
  imports: [CommonModule, ButtonComponent, TranslocoModule, DynamicControls],
  templateUrl: './shop-controls.html',
  styleUrl: './shop-controls.css',
})
export class ShopControls {
  @Input() context: 'producers' | 'upgrades' = 'producers';
  ShopControls = INTERFACE_SHOP;
  constructor(public shopControls: ShopControlsService) {}

  selectAmount(amount: BuyAmount) {
    this.shopControls.setBuyAmount(amount);
  }

  public get hideBought(): boolean {
    return Boolean(this.shopControls.getShowBoughtFilter(this.context)());
  }

  public onHideBoughtChange(value: boolean) {
    this.shopControls.setShowBoughtFilter(this.context, value);
  }
}
