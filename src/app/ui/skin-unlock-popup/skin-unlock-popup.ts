import { Component, OnDestroy, signal, inject } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { AudioService } from '@services/audio.service';
import { SkinsService } from '@services/skins.service';
import { ButtonComponent } from '@ui/button/button';
import { TranslocoModule } from '@jsverse/transloco';
import { SkinModel } from '@models/skin.model';

@Component({
  selector: 'app-skin-unlock-popup',
  standalone: true,
  imports: [ButtonComponent, TranslocoModule, UpperCasePipe],
  templateUrl: './skin-unlock-popup.html',
  styleUrls: ['./skin-unlock-popup.css'],
})
export class SkinUnlockPopup implements OnDestroy {
  current = signal<SkinModel | null>(null);
  visible = signal(false);
  private isProcessing = false;
  private subs = new Subscription();
  private _currentResolve: (() => void) | null = null;

  private skinsService = inject(SkinsService);
  private audioService = inject(AudioService);

  constructor() {
    this.subs.add(
      this.skinsService.queue$.subscribe((queue) => {
        if (queue.length > 0 && !this.isProcessing) {
          this.processQueue().catch((err) => console.error(err));
        }
      }),
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

  private showFor(notification: SkinModel): Promise<void> {
    return new Promise((resolve) => {
      this.current.set(notification);

      setTimeout(() => {
        this.visible.set(true);
        this.audioService.playSfx('/assets/sfx/achievement.mp3', 1);
      }, 50);

      this._currentResolve = resolve;
    });
  }

  onUse(): void {
    const curr = this.current();
    if (!curr) return;

    this.skinsService.updateSkin(curr.id);
    this.audioService.playSfx('/assets/sfx/click02.mp3', 1);
    this.close();
  }

  onClose(): void {
    this.audioService.playSfx('/assets/sfx/click02.mp3', 1);
    this.close();
  }

  private close(): void {
    this.visible.set(false);

    setTimeout(() => {
      this.current.set(null);

      if (this._currentResolve) {
        this._currentResolve();
        this._currentResolve = null;
      }
    }, 450);
  }

  getRarityClass(rarity: string | undefined): string {
    if (!rarity) return '';
    const parts = rarity.split('.');
    const rarityName = parts[parts.length - 1];
    return `rarity-${rarityName}`;
  }
}
