import { Component, Input } from '@angular/core';
import { SkinsService } from '../../services/skins.service';

@Component({
  selector: 'app-skin-card',
  imports: [],
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

  onClick() {
    this.skinsService.updateSkin(this.id);
  }
}
