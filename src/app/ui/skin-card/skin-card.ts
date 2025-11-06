import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkinsService } from '@services/skins.service';
import { CornerCard } from '../corner-card/corner-card';

@Component({
  selector: 'app-skin-card',
  imports: [CornerCard, CommonModule],
  templateUrl: './skin-card.html',
  styleUrl: './skin-card.css',
})
export class SkinCard {
  constructor(private skinsService: SkinsService) {}

  // ID de la skin
  @Input() id: number = 0;
  // Nombre de la skin
  @Input() name: string = '';
  // Descripción de la skin
  @Input() description: string = '';
  // Imagen de la skin
  @Input() image: string = '';

  get isSelected(): boolean {
    return this.skinsService.skinId() === this.id;
  }

  onClick() {
    this.skinsService.updateSkin(this.id);
  }
}
