import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  OnDestroy,
} from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { AudioService } from '@services/audio.service';
import { DailyContractsService } from '@services/daily-contracts.service';
import { HudPanelsService } from '@services/hud-panels.service';
import { DailyContractsWidget } from '@ui/daily-contracts-widget/daily-contracts-widget';

@Component({
  selector: 'app-daily-contracts-panel',
  imports: [TranslocoModule, DailyContractsWidget],
  templateUrl: './daily-contracts-panel.html',
  styleUrl: './daily-contracts-panel.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DailyContractsPanel implements OnDestroy {
  protected readonly contractsService = inject(DailyContractsService);
  protected readonly expanded = computed(() => this.hudPanels.activePanel() === 'contracts');

  private readonly audioService = inject(AudioService);
  private readonly hudPanels = inject(HudPanelsService);
  private readonly elRef = inject(ElementRef<HTMLElement>);

  private outsideTouchHandler?: (event: Event) => void;
  private readonly isTouchDevice =
    (typeof navigator !== 'undefined' && ((navigator as Navigator).maxTouchPoints ?? 0) > 0) ||
    (typeof window !== 'undefined' && 'ontouchstart' in window);

  constructor() {
    effect(() => {
      if (!this.isTouchDevice) {
        return;
      }

      if (this.expanded()) {
        this.outsideTouchHandler = (event: Event) => {
          try {
            const host = this.elRef.nativeElement;
            const path = (event as Event & { composedPath?: () => EventTarget[] }).composedPath?.();

            if ((path && path.includes(host)) || host.contains(event.target as Node)) {
              return;
            }

            this.hudPanels.close('contracts');
          } catch {}
        };

        document.addEventListener('touchstart', this.outsideTouchHandler as EventListener, {
          passive: true,
        });
      } else if (this.outsideTouchHandler) {
        document.removeEventListener('touchstart', this.outsideTouchHandler as EventListener);
        this.outsideTouchHandler = undefined;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.outsideTouchHandler) {
      document.removeEventListener('touchstart', this.outsideTouchHandler as EventListener);
      this.outsideTouchHandler = undefined;
    }

    this.hudPanels.close('contracts');
  }

  protected togglePanel(): void {
    this.hudPanels.toggle('contracts');

    try {
      this.audioService.playSfx('/assets/sfx/click02.mp3', 1);
    } catch {}
  }
}
