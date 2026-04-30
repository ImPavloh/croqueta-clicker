import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { Card } from '@ui/card/card';
import { ButtonComponent } from '@ui/button/button';
import { ModalService } from '@services/modal.service';
import { DebugService } from '@services/debug.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

@Component({
  selector: 'app-help-center',
  imports: [TranslocoModule, Card, ButtonComponent],
  templateUrl: './help-center.html',
  styleUrl: './help-center.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HelpCenterComponent {
  private modalService = inject(ModalService);
  private debugService = inject(DebugService);
  private router = inject(Router);

  protected readonly isDebugMode = toSignal(this.debugService.isDebugMode$, {
    initialValue: this.debugService.isDebugMode,
  });

  protected readonly shortcuts = [
    { keys: 'F1', descriptionKey: 'help.shortcuts.openHelp' },
    { keys: 'F2', descriptionKey: 'help.shortcuts.openOptions' },
    { keys: 'Space / Enter', descriptionKey: 'help.shortcuts.clickCroquette' },
    { keys: '?', descriptionKey: 'help.shortcuts.openHelpAlt' },
    { keys: 'Esc', descriptionKey: 'help.shortcuts.closeModal' },
    { keys: 'Ctrl + Shift + F12', descriptionKey: 'help.shortcuts.openDebug' },
  ];

  protected readonly tips = [
    {
      titleKey: 'help.tips.upgradesTitle',
      descriptionKey: 'help.tips.upgradesDescription',
    },
    {
      titleKey: 'help.tips.contractsTitle',
      descriptionKey: 'help.tips.contractsDescription',
    },
    {
      titleKey: 'help.tips.prestigeTitle',
      descriptionKey: 'help.tips.prestigeDescription',
    },
    {
      titleKey: 'help.tips.reportTitle',
      descriptionKey: 'help.tips.reportDescription',
    },
  ];

  protected openModal(type: 'contracts' | 'options' | 'news'): void {
    if (type === 'news') {
      this.modalService.openModal('news');
      return;
    }

    const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 1344 : false;
    if (isMobile) {
      this.modalService.openModal(type);
      return;
    }

    this.modalService.closeModal();
    void this.router.navigateByUrl(type === 'options' ? '/options' : '/contracts');
  }

  protected openReport(): void {
    if (!this.isDebugMode()) {
      return;
    }

    this.modalService.closeModal();
    this.router.navigateByUrl('/report');
  }
}
