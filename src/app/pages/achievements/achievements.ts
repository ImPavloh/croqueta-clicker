import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { AchievementsService } from '@services/achievements.service';
import { Achievement } from '@data/achievements.data';
import { Tooltip } from '@ui/tooltip/tooltip';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-achievements',
  standalone: true,
  imports: [CommonModule, Tooltip, TranslocoPipe],
  templateUrl: './achievements.html',
  styleUrl: './achievements.css',
})
export class Achievements implements OnDestroy{
  achievementsWithState: Array<Achievement & { unlocked: boolean }> = [];
    private subs = new Subscription();

    constructor(
      private svc: AchievementsService,
      private transloco: TranslocoService
    ) {
      // inicializar con el estado actual (método público)
      this.achievementsWithState = this.svc.getAllWithState();

      // suscribirse a cambios en unlockedMap$ y actualizar la vista inmediatamente
      this.subs.add(
        this.svc.unlockedMap$.subscribe(() => {
          this.achievementsWithState = this.svc.getAllWithState();
        })
      );
    }

    ngOnDestroy(): void {
      this.subs.unsubscribe();
    }

    get unlockedCount(): number {
      return this.svc.getUnlockedCount();
    }

    get totalCount(): number {
      return this.svc.getTotalCount();
    }

    getTooltipText(item: Achievement & { unlocked: boolean }): string {
      if (!item.unlocked && item.secret) {
        return this.transloco.translate('achievements.secretAchievement');
      }
      if (item.description) {
        return this.transloco.translate(item.description);
      }
      return this.transloco.translate('achievements.noDescription');
    }
}
