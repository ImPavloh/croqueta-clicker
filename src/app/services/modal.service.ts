import { Injectable, signal } from '@angular/core';

export type ModalType = 'upgrades' | 'stats' | 'skins' | 'options' | null;

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  public currentModal = signal<ModalType>(null);

  openModal(type: ModalType) {
    this.currentModal.set(type);
  }

  closeModal() {
    this.currentModal.set(null);
  }

  isOpen(type: ModalType): boolean {
    return this.currentModal() === type;
  }
}
