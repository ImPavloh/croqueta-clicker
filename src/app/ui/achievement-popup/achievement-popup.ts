import { Component, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { Subscription } from 'rxjs';
import { AchievementsService } from '@services/achievements.service';
import { Achievement } from '@data/achievements.data';
import { CommonModule } from '@angular/common';
import { AudioService } from '@services/audio.service';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-achievement-popup',
  standalone: true,
  imports: [CommonModule, TranslocoModule],
  templateUrl: './achievement-popup.html',
  styleUrls: ['./achievement-popup.css'],
})
export class AchievementPopup implements OnDestroy {
  current: Achievement | null = null;
  visible = false;
  private isProcessing = false;
  private hideTimeout: any = null;
  private subs = new Subscription();

  private readonly DISPLAY_MS = 3500;
  private readonly FADE_MS = 300;

  constructor(
    private svc: AchievementsService,
    private audioService: AudioService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {
    this.subs.add(
      this.svc.queue$.subscribe((queue) => {
        if (queue.length > 0 && !this.isProcessing) {
          this.processQueue().catch((err) => console.error(err));
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
        const next = this.svc.consumeNext();
        if (!next) break;
        await this.showFor(next);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private showFor(item: Achievement): Promise<void> {
    return new Promise((resolve) => {
      this.current = item;
      this.visible = true;
      this.cdr.detectChanges();

      this.audioService.playSfx('/assets/sfx/achievement.mp3', 1);

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
