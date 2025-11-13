import { Component, effect, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PointsService } from '@services/points.service';
import { SkinsService } from '@services/skins.service';
import { ShortNumberPipe } from '@pipes/short-number.pipe';
import { SKINS } from '@data/skin.data';
import Decimal from 'break_infinity.js';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-counter',
  imports: [CommonModule, ShortNumberPipe],
  templateUrl: './counter.html',
  styleUrl: './counter.css',
})
export class Counter implements OnDestroy {
  skins = SKINS;
  displayPoints = signal(new Decimal(0));
  isAnimating = signal(false);

  private animationFrame: number | null = null;
  private clickSubscription: Subscription | null = null;

  constructor(public pointsService: PointsService, private skinsService: SkinsService) {
    this.displayPoints.set(this.pointsService.points());

    // actualizar sin animación (puntos automáticos)
    effect(() => {
      const currentPoints = this.pointsService.points();
      if (!this.isAnimating()) {
        this.displayPoints.set(currentPoints);
      }
    });

    this.clickSubscription = this.pointsService.onManualClick$.subscribe(() => {
      const from = this.displayPoints();
      const to = this.pointsService.points();
      this.animateCounter(from, to);
    });
  }

  private animateCounter(from: Decimal, to: Decimal): void {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
    }

    this.isAnimating.set(true);
    const startTime = performance.now();
    const duration = 200;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const eased = 1 - Math.pow(1 - progress, 3);

      const current = from.plus(to.minus(from).times(eased));
      this.displayPoints.set(current);

      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(animate);
      } else {
        this.isAnimating.set(false);
        this.animationFrame = null;
        this.displayPoints.set(to);
      }
    };

    this.animationFrame = requestAnimationFrame(animate);
  }

  getCounterLabel(): string {
    const currentSkinId = this.skinsService.skinId();
    const skin = this.skins.find((s) => s.id === currentSkinId);
    const baseLabel = skin?.counterLabel || 'croquetas';
    const points = this.displayPoints();

    if (points.eq(1)) {
      return baseLabel.endsWith('s') ? baseLabel.slice(0, -1) : baseLabel;
    }

    return baseLabel;
  }

  ngOnDestroy(): void {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
    }
    if (this.clickSubscription) {
      this.clickSubscription.unsubscribe();
    }
  }
}
