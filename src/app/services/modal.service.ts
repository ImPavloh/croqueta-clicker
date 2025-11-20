import { Injectable, signal } from '@angular/core';

export type ModalType = 'upgrades' | 'achievements' | 'skins' | 'options' | 'debug' | null;

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  public currentModal = signal<ModalType>(null);
  public confirmDialog = signal<ConfirmDialogData | null>(null);

  openModal(type: ModalType) {
    this.currentModal.set(type);
  }

  closeModal() {
    this.currentModal.set(null);
  }

  isOpen(type: ModalType): boolean {
    return this.currentModal() === type;
  }

  showConfirm(data: ConfirmDialogData) {
    this.confirmDialog.set({
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      ...data,
    });
  }

  closeConfirm() {
    this.confirmDialog.set(null);
  }

  confirm() {
    const dialog = this.confirmDialog();
    if (dialog) {
      dialog.onConfirm();
      this.closeConfirm();
    }
  }

  cancel() {
    const dialog = this.confirmDialog();
    if (dialog?.onCancel) {
      dialog.onCancel();
    }
    this.closeConfirm();
  }
}
