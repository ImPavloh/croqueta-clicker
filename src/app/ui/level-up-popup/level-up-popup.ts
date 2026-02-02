import { Component, OnDestroy, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { LevelUpService, LevelUpNotification } from '@services/level-up.service';
import { AudioService } from '@services/audio.service';

@Component({
  selector: 'app-level-up-popup',
  standalone: true,
  imports: [],
  templateUrl: './level-up-popup.html',
  styleUrls: ['./level-up-popup.css'],
})
export class LevelUpPopup implements OnDestroy {
  current = signal<LevelUpNotification | null>(null);
  visible = signal(false);
  private isProcessing = false;
  private hideTimeout: ReturnType<typeof setTimeout> | null = null;
  private subs = new Subscription();

  private readonly DISPLAY_MS = 2500;
  private readonly FADE_MS = 400;

  constructor(
    private levelUpService: LevelUpService,
    private audioService: AudioService,
  ) {
    this.subs.add(
      this.levelUpService.queue$.subscribe((queue) => {
        if (queue.length > 0 && !this.isProcessing) {
          this.processQueue().catch((err) => console.error(err));
        }
      }),
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
    return new Promise((resolve) => {
      this.current.set(notification);
      this.visible.set(true);
      this.audioService.playSfx('/assets/sfx/achievement.mp3', 1);

      if (this.hideTimeout) clearTimeout(this.hideTimeout);

      this.hideTimeout = setTimeout(() => {
        this.visible.set(false);

        if (this.hideTimeout) clearTimeout(this.hideTimeout);

        this.hideTimeout = setTimeout(() => {
          this.current.set(null);
          resolve();
        }, this.FADE_MS);
      }, this.DISPLAY_MS);
    });
  }
}
