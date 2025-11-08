import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkinsService } from '@services/skins.service';
import { CornerCard } from '@ui/corner-card/corner-card';
import { AudioService } from '@services/audio.service';
import { SkinModel } from 'app/models/skin.model';

@Component({
  selector: 'app-skin-card',
  imports: [CornerCard, CommonModule],
  templateUrl: './skin-card.html',
  styleUrl: './skin-card.css',
})
export class SkinCard {
  private skinsService = inject(SkinsService);
  private audioService = inject(AudioService);

  @Input() config!: SkinModel;

  get isSelected(): boolean {
    return this.skinsService.skinId() === this.config.id;
  }

  onClick() {
    this.skinsService.updateSkin(this.config.id);
    // SFX
    this.audioService.playSfx("/assets/sfx/click02.mp3",1)
  }
}
