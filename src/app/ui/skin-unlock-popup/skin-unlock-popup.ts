import { Component, OnDestroy, ChangeDetectorRef, NgZone, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { SkinUnlockNotification } from '@services/skins.service';
import { CommonModule } from '@angular/common';
import { AudioService } from '@services/audio.service';
import { SkinsService } from '@services/skins.service';
import { ButtonComponent } from '@ui/button/button';

@Component({
  selector: 'app-skin-unlock-popup',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './skin-unlock-popup.html',
  styleUrls: ['./skin-unlock-popup.css'],
})
export class SkinUnlockPopup implements OnDestroy {
  current: SkinUnlockNotification | null = null;
  visible = false;
  private isProcessing = false;
  private subs = new Subscription();

  private skinsService = inject(SkinsService);
  private audioService = inject(AudioService);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);

  constructor() {
    this.subs.add(
      this.skinsService.queue$.subscribe((queue) => {
        if (queue.length > 0 && !this.isProcessing) {
          this.processQueue().catch((err) => console.error(err));
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private async processQueue(): Promise<void> {
    this.isProcessing = true;
    try {
      while (true) {
        const next = this.skinsService.consumeNext();
        if (!next) break;
        await this.showFor(next);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private showFor(notification: SkinUnlockNotification): Promise<void> {
    return new Promise((resolve) => {
      this.zone.run(() => {
        this.current = notification;
        this.cdr.detectChanges();

        setTimeout(() => {
          this.visible = true;
          this.cdr.detectChanges();
          this.audioService.playSfx('/assets/sfx/achievement.mp3', 1);
        }, 50);
      });

      (this as any)._currentResolve = resolve;
    });
  }

  onUse(): void {
    if (!this.current) return;

    this.zone.run(() => {
      this.skinsService.updateSkin(this.current!.skin.id);
      this.audioService.playSfx('/assets/sfx/click02.mp3', 1);
      this.close();
    });
  }

  onClose(): void {
    this.zone.run(() => {
      this.audioService.playSfx('/assets/sfx/click02.mp3', 1);
      this.close();
    });
  }

  private close(): void {
    this.visible = false;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.zone.run(() => {
        this.current = null;
        this.cdr.detectChanges();

        if ((this as any)._currentResolve) {
          (this as any)._currentResolve();
          (this as any)._currentResolve = null;
        }
      });
    }, 450);
  }
}
