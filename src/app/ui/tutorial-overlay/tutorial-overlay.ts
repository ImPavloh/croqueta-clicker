import { CommonModule } from '@angular/common';
import {
  Component,
  ChangeDetectionStrategy,
  signal,
  Output,
  EventEmitter,
  inject,
} from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { OptionsService } from '@services/options.service';
import { TUTORIAL_OVERLAY_STEPS } from '@data/tutorial-overlay.data';
import { TutorialOverlayStep } from '@models/tutorial-overlay.model';
import { ButtonComponent } from '@ui/button/button';

@Component({
  selector: 'app-tutorial-overlay',
  standalone: true,
  imports: [CommonModule, TranslocoModule, ButtonComponent],
  templateUrl: './tutorial-overlay.html',
  styleUrls: ['./tutorial-overlay.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TutorialOverlayComponent {
  private options = inject(OptionsService);

  @Output() completed = new EventEmitter<void>();

  readonly steps: TutorialOverlayStep[] = TUTORIAL_OVERLAY_STEPS;

  currentIndex = signal(0);
  fading = signal(false);

  get isLast(): boolean {
    return this.currentIndex() === this.steps.length - 1;
  }

  next() {
    if (this.isLast) {
      this.finish();
      return;
    }
    this.animateTo(this.currentIndex() + 1);
  }

  prev() {
    if (this.currentIndex() === 0) return;
    this.animateTo(this.currentIndex() - 1);
  }

  private animateTo(target: number) {
    this.fading.set(true);
    setTimeout(() => {
      this.currentIndex.set(target);
      this.fading.set(false);
    }, 180);
  }

  finish() {
    this.options.setGameItem('tutorial_completed', 'true');
    this.completed.emit();
  }

  close() {
    this.finish();
  }
}
