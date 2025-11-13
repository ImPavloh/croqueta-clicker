import { Component, inject } from '@angular/core';
import { ModalService } from '@services/modal.service';
import { AudioService } from '@services/audio.service';
import { Upgrades } from '@pages/upgrades/upgrades';
import { Stats } from '@pages/stats/stats';
import { Skins } from '@pages/skins/skins';
import { Options } from '@pages/options/options';
import { ButtonComponent } from '@ui/button/button';

@Component({
  selector: 'app-modal',
  imports: [Upgrades, Stats, Skins, Options, ButtonComponent],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class Modal {
  protected modalService = inject(ModalService);
  private audioService = inject(AudioService);

  closeModal() {
    this.modalService.closeModal();
    this.audioService.playSfx('/assets/sfx/click02.mp3', 1);
  }

  getModalTitle(): string {
    const modal = this.modalService.currentModal();
    switch (modal) {
      case 'upgrades':
        return 'Mejoras';
      case 'stats':
        return 'Estadísticas';
      case 'skins':
        return 'Skins';
      case 'options':
        return 'Opciones';
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
