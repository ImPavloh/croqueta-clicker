import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AchievementsService } from '@services/achievements.service';
import { ACHIEVEMENTS, Achievement } from '@data/achievements.data';
import { CommonModule } from '@angular/common';
import { CornerCard } from '@ui/corner-card/corner-card';

@Component({
  selector: 'app-achievement-list',
  standalone: true,
  imports: [CommonModule, CornerCard],
  templateUrl: './achievement-list.html',
  styleUrls: ['./achievement-list.css'],
})
export class AchievementList implements OnDestroy {
  achievementsWithState: Array<Achievement & { unlocked: boolean }> = [];
  private subs = new Subscription();

  constructor(private svc: AchievementsService) {
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
}
