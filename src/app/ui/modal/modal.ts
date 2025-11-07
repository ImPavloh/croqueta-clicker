import { Component, inject } from '@angular/core';
import { ModalService } from '@services/modal.service';
import { Upgrades } from '@pages/upgrades/upgrades';
import { Stats } from '@pages/stats/stats';
import { Skins } from '@pages/skins/skins';
import { Options } from '@pages/options/options';

@Component({
  selector: 'app-modal',
  imports: [Upgrades, Stats, Skins, Options],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class Modal {
  protected modalService = inject(ModalService);

  closeModal() {
    this.modalService.closeModal();
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
}
