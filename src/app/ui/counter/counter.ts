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
    if (this.clickSubscription) {
      this.clickSubscription.unsubscribe();
    }
  }
}
