import { Component, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PointsService } from '@services/points.service';
import { SkinsService } from '@services/skins.service';
import { ShortNumberPipe } from '@pipes/short-number.pipe';
import { SKINS } from '@data/skin.data';

import { TranslocoModule } from '@jsverse/transloco';

/**
 * Componente que muestra el contador principal de croquetas.
 * Incluye animaciones al ganar puntos por clic y muestra el label personalizado según la skin.
 */
@Component({
  selector: 'app-counter',
  imports: [CommonModule, ShortNumberPipe, TranslocoModule],
  templateUrl: './counter.html',
  styleUrl: './counter.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Counter {
  /** Lista de todas las skins disponibles */
  skins = SKINS;

  /** Indica si hay una animación de puntos en curso */
  isAnimating = signal(false);

  counterLabel = computed(() => {
    const currentSkinId = this.skinsService.skinId();
    const skin = this.skins.find((s) => s.id === currentSkinId);
    const baseLabel = skin?.counterLabel || 'clicker.croquetas';

    if (this.pointsService.displayPoints() === '1') {
      return baseLabel.endsWith('s') ? baseLabel.slice(0, -1) : baseLabel;
    }

    return baseLabel;
  });

  constructor(
    public pointsService: PointsService,
    private skinsService: SkinsService,
  ) {}
}
