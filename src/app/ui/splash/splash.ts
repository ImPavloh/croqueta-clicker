import { Component, signal, OnInit, ChangeDetectionStrategy, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './splash.html',
  styleUrl: './splash.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Splash implements OnInit {
  protected readonly splashShown = signal(true);

  // Event emitter para notificar cuando el splash termina
  public readonly splashComplete = output<void>();

  ngOnInit(): void {
    // El splash se oculta solo con click o tras 5s
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        if (this.splashShown()) {
          this.splashShown.set(false);
          this.splashComplete.emit();
        }
      }, 5000);
    }
  }

  protected hideSplash(): void {
    this.splashShown.set(false);
    this.splashComplete.emit();
  }
}
