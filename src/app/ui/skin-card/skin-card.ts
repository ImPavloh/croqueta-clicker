import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkinsService } from '@services/skins.service';
import { CornerCard } from '@ui/corner-card/corner-card';
import { AudioService } from '@services/audio.service';

@Component({
  selector: 'app-skin-card',
  imports: [CornerCard, CommonModule],
  templateUrl: './skin-card.html',
  styleUrl: './skin-card.css',
})
export class SkinCard {
  constructor(private skinsService: SkinsService, private audioService: AudioService) {}

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
    // SFX
    this.audioService.playSfx("/assets/sfx/click02.mp3",1)
  }
}
