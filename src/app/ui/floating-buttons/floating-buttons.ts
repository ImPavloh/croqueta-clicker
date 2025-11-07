import { Component, inject } from '@angular/core';
import { ModalService } from '@services/modal.service';

@Component({
  selector: 'app-floating-buttons',
  imports: [],
  templateUrl: './floating-buttons.html',
  styleUrl: './floating-buttons.css',
})
export class FloatingButtons {
  private modalService = inject(ModalService);

  openUpgrades() {
    this.modalService.openModal('upgrades');
  }

  openStats() {
    this.modalService.openModal('stats');
  }

  openSkins() {
    this.modalService.openModal('skins');
  }

  openOptions() {
    this.modalService.openModal('options');
  }
}
