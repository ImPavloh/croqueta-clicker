import { Component, effect, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PointsService } from '@services/points.service';
import { SkinsService } from '@services/skins.service';
import { ShortNumberPipe } from '@pipes/short-number.pipe';
import { SKINS } from '@data/skin.data';
import Decimal from 'break_infinity.js';
import { Subscription } from 'rxjs';

import { TranslocoModule } from '@jsverse/transloco';

/**
 * Componente que muestra el contador principal de croquetas.
 * Incluye animaciones al ganar puntos por clic y muestra el label personalizado según la skin.
 */
@Component({
  selector: 'app-counter',
  standalone: true,
  imports: [CommonModule, ShortNumberPipe, TranslocoModule],
  templateUrl: './counter.html',
  styleUrl: './counter.css',
})
export class Counter implements OnDestroy {
  /** Lista de todas las skins disponibles */
  skins = SKINS;

  /** Valor mostrado en el contador (puede diferir temporalmente del valor real durante animaciones) */
  displayPoints = signal(new Decimal(0));

  /** Indica si hay una animación de puntos en curso */
  isAnimating = signal(false);

  /** Suscripción a eventos de clic para animaciones */
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

  /**
   * Obtiene el label personalizado del contador según la skin activa.
   * Aplica singular/plural automáticamente.
   * @returns Clave de traducción del label
   */
  getCounterLabel(): string {
    const currentSkinId = this.skinsService.skinId();
    const skin = this.skins.find((s) => s.id === currentSkinId);
    const baseLabel = skin?.counterLabel || 'clicker.croquetas';
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
