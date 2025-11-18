import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkinsService } from '@services/skins.service';
import { ButtonComponent } from '@ui/button/button';
import { AudioService } from '@services/audio.service';
import { SkinModel } from 'app/models/skin.model';
import { Tooltip } from '@ui/tooltip/tooltip';

@Component({
  selector: 'app-skin-card',
  imports: [ButtonComponent, CommonModule, Tooltip],
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

  get isUnlocked(): boolean {
    return this.skinsService.isSkinUnlocked(this.config);
  }

  get unlockText(): string {
    if (this.isUnlocked || !this.config.unlockRequirement) {
      return this.config.description;
    }
    return `${this.config.description}\n\nRequisito: ${this.skinsService.getUnlockRequirementText(
      this.config.unlockRequirement
    )}`;
  }

  onClick() {
    if (!this.isUnlocked) {
      // SFX de error o bloqueado
      this.audioService.playSfx('/assets/sfx/click02.mp3', 0.5);
      return;
    }

    this.skinsService.updateSkin(this.config.id);
    // SFX
    this.audioService.playSfx('/assets/sfx/click02.mp3', 1);
  }
}
