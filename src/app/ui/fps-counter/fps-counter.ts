import { Component, NgZone, OnInit, OnDestroy, signal, Renderer2, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-fps-counter',
  standalone: true,
  templateUrl: './fps-counter.html',
  styleUrl: './fps-counter.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FpsCounterComponent implements OnInit, OnDestroy {
  fps = signal(0);
  isVisible = signal(false);

  private lastTime = performance.now();
  private frames = 0;
  private animationFrameId: number | null = null;
  private cleanups: (() => void)[] = [];

  constructor(private ngZone: NgZone, private renderer: Renderer2) {}

  ngOnInit() {
    this.ngZone.runOutsideAngular(() => {
      // Toggle listener
      const cleanupListener = this.renderer.listen(window, 'keydown', (event: KeyboardEvent) => {
        if (event.ctrlKey && event.shiftKey && event.key === 'F10') {
          this.ngZone.run(() => {
            this.isVisible.update(v => !v);
          });
        }
      });
      this.cleanups.push(cleanupListener);

      // FPS Loop
      const loop = (time: number) => {
        this.frames++;
        if (time - this.lastTime >= 1000) {
          const currentFps = Math.round((this.frames * 1000) / (time - this.lastTime));
          // Only update signal if visible to avoid unnecessary CD when hidden
          if (this.isVisible()) {
            this.ngZone.run(() => this.fps.set(currentFps));
          }
          this.frames = 0;
          this.lastTime = time;
        }
        this.animationFrameId = requestAnimationFrame(loop);
      };
      this.animationFrameId = requestAnimationFrame(loop);
    });
  }

  ngOnDestroy() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.cleanups.forEach(c => c());
  }
}
