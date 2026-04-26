import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ButtonComponent } from '@ui/button/button';
import { TranslocoModule } from '@jsverse/transloco';
import { DailyContractsService } from '@services/daily-contracts.service';
import { ActiveDailyContract } from '@models/daily-contract.model';

@Component({
  selector: 'app-daily-contracts-widget',
  imports: [ButtonComponent, TranslocoModule],
  templateUrl: './daily-contracts-widget.html',
  styleUrl: './daily-contracts-widget.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DailyContractsWidget {
  mode = input<'embedded' | 'panel'>('embedded');

  protected contractsService = inject(DailyContractsService);

  protected previewContracts = computed(() => {
    return [...this.contractsService.contracts()]
      .sort((left, right) => {
        const leftRank = left.claimed ? 0 : left.progress >= left.target ? 3 : 1;
        const rightRank = right.claimed ? 0 : right.progress >= right.target ? 3 : 1;
        return rightRank - leftRank;
      })
      .slice(0, 2);
  });

  protected progressPercent(contract: ActiveDailyContract): number {
    if (contract.target <= 0) {
      return 0;
    }
    return Math.max(0, Math.min(100, Math.round((contract.progress / contract.target) * 100)));
  }
}
