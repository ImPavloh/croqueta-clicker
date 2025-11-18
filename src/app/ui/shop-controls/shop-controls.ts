import { Component } from '@angular/core';
import { ShopControlsService, BuyAmount } from '@services/shop-controls.service';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '@ui/button/button';

@Component({
  selector: 'app-shop-controls',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './shop-controls.html',
  styleUrl: './shop-controls.css',
})
export class ShopControls {
  constructor(public shopControls: ShopControlsService) {}

  selectAmount(amount: BuyAmount) {
    this.shopControls.setBuyAmount(amount);
  }
}
