import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skin-card',
  imports: [],
  templateUrl: './skin-card.html',
  styleUrl: './skin-card.css',
})
export class SkinCard {
  // ID de la skin
  @Input() id: number = 0;
  // Nombre de la skin
  @Input() name: string = '';
  // Descripción de la skin
  @Input() description: string = '';
  // Imagen de la skin
  @Input() image: string = '';
}
