import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  NgZone,
  OnInit,
  OnDestroy,
  Renderer2,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DebugService } from '@services/debug.service';
import { RouterLink, RouterModule } from '@angular/router';
import { NewsLine } from '@ui/newsline/newsline';
import { ButtonComponent } from '@ui/button/button';
import { TranslocoModule } from '@jsverse/transloco';
import { ModalService } from '@services/modal.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, RouterLink, NewsLine, ButtonComponent, TranslocoModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar implements OnInit, OnDestroy {
  private ngZone = inject(NgZone);
  private renderer = inject(Renderer2);
  private debugService = inject(DebugService);
  private modalService = inject(ModalService);
  private resizeListener?: () => void;

  public isMobile = signal<boolean>(
    typeof window !== 'undefined' ? window.innerWidth <= 1344 : false,
  );

  isDebug = toSignal(this.debugService.isDebugMode$, {
    initialValue: this.debugService.isDebugMode,
  });

  ngOnInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.resizeListener = this.renderer.listen(window, 'resize', () => {
        const newIsMobile = window.innerWidth <= 1344;
        if (newIsMobile !== this.isMobile()) {
          this.ngZone.run(() => {
            this.isMobile.set(newIsMobile);
          });
        }
      });
    });
  }

  ngOnDestroy(): void {
    if (this.resizeListener) {
      this.resizeListener();
    }
  }

  protected openContractsModal(): void {
    this.modalService.openModal('contracts');
  }
}
