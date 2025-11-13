import { Component, signal, OnInit, ChangeDetectionStrategy, output } from '@angular/core';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.html',
  styleUrl: './splash.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Splash implements OnInit {
  protected readonly splashShown = signal(true);

  // Event emitter para notificar cuando el splash termina
  public readonly splashComplete = output<void>();

  ngOnInit(): void {
    // ocultar splash automáticamente tras 5s
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        this.splashShown.set(false);
        this.splashComplete.emit();
      }, 5000);
    }
  }

  protected hideSplash(): void {
    this.splashShown.set(false);
    this.splashComplete.emit();
  }
}
