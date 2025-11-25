import { Component, Input } from '@angular/core';
import { ToggleSwitch } from '@ui/toggle-switch/toggle-switch';
import { ShopControlsService, BuyAmount } from '@services/shop-controls.service';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '@ui/button/button';

import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-shop-controls',
  standalone: true,
  imports: [CommonModule, ButtonComponent, TranslocoModule, ToggleSwitch],
  templateUrl: './shop-controls.html',
  styleUrl: './shop-controls.css',
})
export class ShopControls {
  @Input() context: 'producers' | 'upgrades' = 'producers';
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
