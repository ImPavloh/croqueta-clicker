import { Component, inject } from '@angular/core';
import { ModalService } from '@services/modal.service';
import { AudioService } from '@services/audio.service';
import { Upgrades } from '@pages/upgrades/upgrades';
import { Achievements } from '@pages/achievements/achievements';
import { Skins } from '@pages/skins/skins';
import { Options } from '@pages/options/options';
import { ButtonComponent } from '@ui/button/button';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { DebugMenuComponent } from '../../pages/debug-menu/debug-menu';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [Upgrades, Achievements, Skins, Options, ButtonComponent, TranslocoModule, DebugMenuComponent],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class Modal {
  protected modalService = inject(ModalService);
  private audioService = inject(AudioService);
  private translocoService = inject(TranslocoService);

  closeModal() {
    this.modalService.closeModal();
    this.audioService.playSfx('/assets/sfx/click02.mp3', 1);
  }

  getModalTitle(): string {
    const modal = this.modalService.currentModal();
    switch (modal) {
      case 'upgrades':
        return this.translocoService.translate('upgrades.title');
      case 'achievements':
        return this.translocoService.translate('achievements.title');
      case 'skins':
        return this.translocoService.translate('skins.title');
      case 'options':
        return this.translocoService.translate('options.title');
      case 'debug':
        return this.translocoService.translate('debug.title');
      default:
        return '';
    }
  }

  closeConfirm() {
    this.modalService.closeConfirm();
  }

  confirmAction() {
    this.modalService.confirm();
  }

  cancelAction() {
    this.modalService.cancel();
  }
}
