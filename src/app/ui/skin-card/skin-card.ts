import { Component, computed, inject, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkinsService } from '@services/skins.service';
import { ButtonComponent } from '@ui/button/button';
import { AudioService } from '@services/audio.service';
import { SkinModel } from 'app/models/skin.model';
import { Tooltip } from '@ui/tooltip/tooltip';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-skin-card',
  imports: [ButtonComponent, CommonModule, Tooltip, TranslocoModule],
  templateUrl: './skin-card.html',
  styleUrl: './skin-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkinCard {
  private skinsService = inject(SkinsService);
  private audioService = inject(AudioService);
  private translocoService = inject(TranslocoService);
  private selectedSkinId = toSignal(this.skinsService.skinChanged$, {
    initialValue: this.skinsService.skinId(),
  });

  config = input.required<SkinModel>();

  readonly isSelected = computed(() => this.selectedSkinId() === this.config().id);

  readonly isUnlocked = computed(() => {
    this.skinsService.unlockStateVersion();
    return this.skinsService.isSkinUnlocked(this.config());
  });

  readonly unlockText = computed(() => {
    const cfg = this.config();
    if (this.isUnlocked() || !cfg.unlockRequirement) {
      return this.translocoService.translate(cfg.description);
    }
    const requirementText = this.skinsService.getUnlockRequirementText(cfg.unlockRequirement);
    const labeled = this.translocoService.translate('skins.unlock.requirement', {
      value: requirementText,
    });

    return `${this.translocoService.translate(cfg.description)}\n\n${labeled}`;
  });

  onClick() {
    if (!this.isUnlocked()) {
      // SFX de error o bloqueado
      this.audioService.playSfx('/assets/sfx/click02.mp3', 0.5);
      return;
    }

    this.skinsService.updateSkin(this.config().id);
    // SFX
    this.audioService.playSfx('/assets/sfx/click02.mp3', 1);
  }
}
