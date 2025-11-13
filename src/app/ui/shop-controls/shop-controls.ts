import { Component } from '@angular/core';
import {
  ShopControlsService,
  BuyAmount,
  SortOrder,
  FilterType,
} from '@services/shop-controls.service';
import { CommonModule } from '@angular/common';
import { AudioService } from '@services/audio.service';
import { ButtonComponent } from '@ui/button/button';
import { ToggleSwitch } from '@ui/toggle-switch/toggle-switch';

@Component({
  selector: 'app-shop-controls',
  standalone: true,
  imports: [CommonModule, ButtonComponent, ToggleSwitch],
  templateUrl: './shop-controls.html',
  styleUrl: './shop-controls.css',
})
export class ShopControls {
  constructor(public shopControls: ShopControlsService, private audioService: AudioService) {}

  selectAmount(amount: BuyAmount) {
    this.shopControls.setBuyAmount(amount);
  }

  selectSort(order: SortOrder) {
    this.shopControls.setSortOrder(order);
  }

  selectFilter(filter: FilterType) {
    this.shopControls.setFilter(filter);
  }
}
