import { Component, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { Subscription } from 'rxjs';
import { LevelUpService, LevelUpNotification } from '@services/level-up.service';
import { CommonModule } from '@angular/common';
import { AudioService } from '@services/audio.service';

@Component({
  selector: 'app-level-up-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './level-up-popup.html',
  styleUrls: ['./level-up-popup.css'],
})
export class LevelUpPopup implements OnDestroy {
  current: LevelUpNotification | null = null;
  visible = false;
  private isProcessing = false;
  private hideTimeout: any = null;
  private subs = new Subscription();

  private readonly DISPLAY_MS = 2500;
  private readonly FADE_MS = 400;

  constructor(
    private levelUpService: LevelUpService,
    private audioService: AudioService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {
    this.subs.add(
      this.levelUpService.queue$.subscribe(queue => {
        if (queue.length > 0 && !this.isProcessing) {
          this.processQueue().catch(err => console.error(err));
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
  }

  private async processQueue(): Promise<void> {
    this.isProcessing = true;
    try {
      while (true) {
        const next = this.levelUpService.consumeNext();
        if (!next) break;
        await this.showFor(next);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private showFor(notification: LevelUpNotification): Promise<void> {
    return new Promise(resolve => {
      this.current = notification;
      this.visible = true;
      this.cdr.detectChanges();
      this.audioService.playSfx("/assets/sfx/achievement.mp3", 1);

      if (this.hideTimeout) clearTimeout(this.hideTimeout);

      this.hideTimeout = setTimeout(() => {
        this.zone.run(() => {
          this.visible = false;
          this.cdr.detectChanges();

          if (this.hideTimeout) clearTimeout(this.hideTimeout);

          this.hideTimeout = setTimeout(() => {
            this.zone.run(() => {
              this.current = null;
              this.cdr.detectChanges();
              resolve();
            });
          }, this.FADE_MS);
        });
      }, this.DISPLAY_MS);
    });
  }
}
