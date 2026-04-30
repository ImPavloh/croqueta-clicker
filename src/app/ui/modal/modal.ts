import { Component, ElementRef, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalService } from '@services/modal.service';
import { AudioService } from '@services/audio.service';
import { SupabaseService } from '@services/supabase.service';
import { DebugService } from '@services/debug.service';
import { UsernameService } from '@services/username.service';
import { Upgrades } from '@pages/upgrades/upgrades';
import { Achievements } from '@pages/achievements/achievements';
import { Contracts } from '@pages/contracts/contracts';
import { Skins } from '@pages/skins/skins';
import { Options } from '@pages/options/options';
import { News } from '@pages/news/news';
import { ButtonComponent } from '@ui/button/button';
import { InputComponent } from '@ui/input/input';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { DebugMenuComponent } from '../../pages/debug-menu/debug-menu';
import { Leaderboard } from '@ui/leaderboard/leaderboard';
import { HelpCenterComponent } from '../../pages/help-center/help-center';

@Component({
  selector: 'app-modal',
  imports: [
    Upgrades,
    Achievements,
    Contracts,
    Skins,
    Options,
    HelpCenterComponent,
    News,
    ButtonComponent,
    InputComponent,
    TranslocoModule,
    DebugMenuComponent,
    Leaderboard,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class Modal {
  protected modalService = inject(ModalService);
  private audioService = inject(AudioService);
  private translocoService = inject(TranslocoService);
  private supabase = inject(SupabaseService);
  private debugService = inject(DebugService);
  private usernameService = inject(UsernameService);
  private host = inject(ElementRef<HTMLElement>);
  private hadOpenModal = false;
  private lastFocusedElement: HTMLElement | null = null;

  desiredName = signal('');
  usernameLoading = signal(false);
  usernameMessage = signal('');
  isRendered = signal(false);
  isClosing = signal(false);

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
      case 'contracts':
        return this.translocoService.translate('contracts.title');
      case 'skins':
        return this.translocoService.translate('skins.title');
      case 'options':
        return this.translocoService.translate('options.title');
      case 'help':
        return this.translocoService.translate('help.title');
      case 'debug':
        return this.translocoService.translate('debug.title');
      case 'username':
        return this.translocoService.translate('user.chooseUsername');
      case 'leaderboard':
        return this.translocoService.translate('leaderboard.title');
      case 'news':
        return this.translocoService.translate('news.title');
      case 'confirm-dialog':
        return this.modalService.confirmDialog()?.title ?? '';
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

  onModalKeydown(event: KeyboardEvent) {
    if (event.key !== 'Tab') {
      return;
    }

    const container = this.getModalContent();
    if (!container) {
      return;
    }

    const focusable = this.getFocusableElements(container);
    if (focusable.length === 0) {
      event.preventDefault();
      container.focus();
      return;
    }

    const current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey) {
      if (!current || current === first || !container.contains(current)) {
        event.preventDefault();
        last.focus();
      }
      return;
    }

    if (!current || current === last || !container.contains(current)) {
      event.preventDefault();
      first.focus();
    }
  }

  // todos los mensajes set hay que cambiarlos a traducciones
  async setUsername() {
    // bloquear en modo debug
    if (this.debugService?.isDebugMode) {
      this.usernameMessage.set(this.translocoService.translate('user.debugDisabledInteractions'));
      return;
    }
    const name = (this.desiredName() || '').trim();
    if (!name) {
      this.usernameMessage.set(this.translocoService.translate('user.enterUsername'));
      return;
    }

    // Validate username locally before calling supabase
    const validation = this.usernameService.validate(name);
    if (!validation.valid) {
      switch (validation.reason) {
        case 'length':
          this.usernameMessage.set(this.translocoService.translate('user.invalidUsernameTooLong'));
          break;
        case 'banned':
          this.usernameMessage.set(this.translocoService.translate('user.invalidUsernameBanned'));
          break;
        case 'weird':
          this.usernameMessage.set(this.translocoService.translate('user.invalidUsernameWeird'));
          break;
        default:
          this.usernameMessage.set(this.translocoService.translate('user.invalidUsername'));
      }
      return;
    }

    this.usernameLoading.set(true);
    const taken = await this.supabase.isUsernameTaken(name);
    if (taken) {
      this.usernameMessage.set(this.translocoService.translate('user.usernameTaken'));
      this.usernameLoading.set(false);
      return;
    }

    const resp = await this.supabase.updateUserName(name);
    if (resp.error) {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        this.supabase.enqueuePendingScore(
          0,
          { reason: 'username-reserve' },
          { usernameChange: name },
        );
        this.usernameMessage.set(this.translocoService.translate('user.usernameReservedOffline'));
        this.usernameLoading.set(false);
        this.modalService.closeModal();
        this.usernameMessage.set('');
        this.desiredName.set('');
        return;
      }
      this.usernameMessage.set(
        this.translocoService.translate('user.setUsernameErrorDetail', {
          error: resp.error?.message ?? '',
        }),
      );
      this.usernameLoading.set(false);
      return;
    }

    this.usernameMessage.set(this.translocoService.translate('user.setUsernameSuccess'));
    this.usernameLoading.set(false);
    this.closeModal();
    this.usernameMessage.set('');
    this.desiredName.set('');
  }

  constructor() {
    const updateRender = () => {
      const m = this.modalService.currentModal();
      if (m) {
        this.isRendered.set(true);
        this.isClosing.set(false);
      } else if (this.isRendered()) {
        this.isClosing.set(true);
        setTimeout(() => this.isRendered.set(false), 320);
      }
    };

    updateRender();

    const loop = () => {
      updateRender();
      requestAnimationFrame(loop);
    };
    loop();

    effect(() => {
      const modal = this.modalService.currentModal();

      if (modal) {
        if (!this.hadOpenModal) {
          this.lastFocusedElement =
            document.activeElement instanceof HTMLElement ? document.activeElement : null;
          this.hadOpenModal = true;
        }

        requestAnimationFrame(() => this.focusInitialElement());
        return;
      }

      if (this.hadOpenModal) {
        this.hadOpenModal = false;
        this.restoreFocus();
      }
    });
  }

  private focusInitialElement() {
    const container = this.getModalContent();
    if (!container) {
      return;
    }

    const [firstFocusable] = this.getFocusableElements(container);
    (firstFocusable ?? container).focus();
  }

  private restoreFocus() {
    const previous = this.lastFocusedElement;
    this.lastFocusedElement = null;

    if (previous?.isConnected) {
      previous.focus();
    }
  }

  private getModalContent(): HTMLElement | null {
    return this.host.nativeElement.querySelector('.modal-content');
  }

  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    return Array.from(
      container.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => !element.hasAttribute('disabled'));
  }
}
