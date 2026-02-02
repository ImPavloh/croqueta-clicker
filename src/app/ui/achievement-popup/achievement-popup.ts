import { Component, OnDestroy, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { AchievementsService } from '@services/achievements.service';
import { AudioService } from '@services/audio.service';
import { TranslocoModule } from '@jsverse/transloco';
import { AchievementModel } from '@models/achivement.model';

@Component({
  selector: 'app-achievement-popup',
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './achievement-popup.html',
  styleUrls: ['./achievement-popup.css'],
})
export class AchievementPopup implements OnDestroy {
  current = signal<AchievementModel | null>(null);
  visible = signal(false);
  private isProcessing = false;
  private hideTimeout: ReturnType<typeof setTimeout> | null = null;
  private subs = new Subscription();

  private readonly DISPLAY_MS = 3500;
  private readonly FADE_MS = 300;

  constructor(
    private svc: AchievementsService,
    private audioService: AudioService,
  ) {
    this.subs.add(
      this.svc.queue$.subscribe((queue) => {
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
        const next = this.svc.consumeNext();
        if (!next) break;
        await this.showFor(next);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private showFor(item: AchievementModel): Promise<void> {
    return new Promise((resolve) => {
      this.current.set(item);
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
