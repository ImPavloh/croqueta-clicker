import { Component } from '@angular/core';
import {
  ShopControlsService,
  BuyAmount,
  SortOrder,
  FilterType,
} from '@services/shop-controls.service';
import { CommonModule } from '@angular/common';
import { AudioService } from '@services/audio.service';

@Component({
  selector: 'app-shop-controls',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shop-controls.html',
  styleUrl: './shop-controls.css',
})
export class ShopControls {
  constructor(public shopControls: ShopControlsService, private audioService: AudioService) {}

  selectAmount(amount: BuyAmount) {
    this.audioService.playSfx('/assets/sfx/click02.mp3', 1);
    this.shopControls.setBuyAmount(amount);
  }

  selectSort(order: SortOrder) {
    this.audioService.playSfx('/assets/sfx/click02.mp3', 1);
    this.shopControls.setSortOrder(order);
  }

  selectFilter(filter: FilterType) {
    this.audioService.playSfx('/assets/sfx/click02.mp3', 1);
    this.shopControls.setFilter(filter);
  }
}
