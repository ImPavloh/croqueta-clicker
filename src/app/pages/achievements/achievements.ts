import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { AchievementsService } from '@services/achievements.service';
import { Tooltip } from '@ui/tooltip/tooltip';
import { Subscription } from 'rxjs';
import { AchievementModel } from '@models/achivement.model';

@Component({
  selector: 'app-achievements',
  standalone: true,
  imports: [CommonModule, Tooltip, TranslocoPipe],
  templateUrl: './achievements.html',
  styleUrl: './achievements.css',
})

export class Achievements implements OnDestroy{

  //Array que contiene todos los logros junto con su estado de desbloqueo.
  achievementsWithState: Array<AchievementModel & { unlocked: boolean }> = [];
  private subs = new Subscription();

  //Servicio para gestionar la lógica de los logros.
  private svc = inject(AchievementsService);
  //Servicio para la internacionalización de textos.
  private transloco = inject(TranslocoService);

  constructor() {
    // Inicializa la lista de logros con su estado actual al construir el componente.
    this.achievementsWithState = this.svc.getAllWithState();

    // Se suscribe a los cambios en los logros desbloqueados para actualizar la vista dinámicamente.
    this.subs.add(
      this.svc.unlockedMap$.subscribe(() => {
        this.achievementsWithState = this.svc.getAllWithState();
      })
    );
  }

  /**
   * Método del ciclo de vida de Angular que se ejecuta al destruir el componente.
   * Se desuscribe de todas las suscripciones para evitar fugas de memoria.
   */
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  /**
   * Obtiene el número de logros que han sido desbloqueados.
   * @returns El total de logros desbloqueados.
   */
  get unlockedCount(): number {
    return this.svc.getUnlockedCount();
  }

  /**
   * Obtiene el número total de logros disponibles en el juego.
   * @returns El número total de logros.
   */
  get totalCount(): number {
    return this.svc.getTotalCount();
  }

  /**
   * Genera el texto para el tooltip de un logro específico.
   * @param item El logro (con su estado de desbloqueo) para el que se generará el texto.
   * @returns El texto traducido para el tooltip.
   */
  getTooltipText(item: AchievementModel & { unlocked: boolean }): string {
    if (!item.unlocked && item.secret) {
      return this.transloco.translate('achievements.secretAchievement');
    }
    if (item.description) {
      return this.transloco.translate(item.description);
    }
    return this.transloco.translate('achievements.noDescription');
  }
}
