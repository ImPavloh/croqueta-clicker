import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { Card } from '@ui/card/card';
import { ButtonComponent } from '@ui/button/button';
import { DailyContractsService } from '@services/daily-contracts.service';
import { ActiveDailyContract, DailyContractReward } from '@models/daily-contract.model';

@Component({
  selector: 'app-contracts',
  imports: [Card, ButtonComponent, TranslocoModule],
  templateUrl: './contracts.html',
  styleUrl: './contracts.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Contracts {
  protected contractsService = inject(DailyContractsService);
  private transloco = inject(TranslocoService);

  protected contracts = this.contractsService.contracts;
  protected totalCount = this.contractsService.totalCount;
  protected completedCount = this.contractsService.completedCount;
  protected claimedCount = this.contractsService.claimedCount;
  protected claimableCount = this.contractsService.claimableCount;
  protected completionRatio = this.contractsService.completionRatio;
  protected resetTimeLabel = this.contractsService.resetTimeLabel;
  protected bonusReward = this.contractsService.bonusReward;
  protected bonusAvailable = this.contractsService.bonusAvailable;
  protected bonusClaimed = this.contractsService.bonusClaimed;
  protected currentStreak = this.contractsService.currentStreak;
  protected bestStreak = this.contractsService.bestStreak;
  protected weeklyCompletedDays = this.contractsService.weeklyCompletedDays;
  protected lifetimeCompletedDays = this.contractsService.lifetimeCompletedDays;
  protected lifetimeBonusClaims = this.contractsService.lifetimeBonusClaims;

  protected bonusRewardLabel = computed(() => {
    const reward = this.bonusReward();
    return reward ? this.rewardLabelFromReward(reward) : '';
  });

  protected bonusStatusLabel = computed(() => {
    if (this.bonusClaimed()) {
      return this.transloco.translate('contracts.bonusClaimedButton');
    }
    if (this.bonusAvailable()) {
      return this.transloco.translate('contracts.bonusClaimButton');
    }
    return this.transloco.translate('contracts.bonusLockedButton');
  });

  protected sortedContracts = computed(() => {
    return [...this.contracts()].sort((left, right) => {
      const leftScore = this.getSortScore(left);
      const rightScore = this.getSortScore(right);
      return rightScore - leftScore;
    });
  });

  protected claim(contractId: string): void {
    this.contractsService.claimContract(contractId);
  }

  protected claimBonus(): void {
    this.contractsService.claimBonus();
  }

  protected progressPercent(contract: ActiveDailyContract): number {
    if (contract.target <= 0) {
      return 0;
    }
    return Math.max(0, Math.min(100, Math.round((contract.progress / contract.target) * 100)));
  }

  protected isCompleted(contract: ActiveDailyContract): boolean {
    return contract.progress >= contract.target;
  }

  protected rewardLabel(contract: ActiveDailyContract): string {
    return this.rewardLabelFromReward(contract.reward);
  }

  private rewardLabelFromReward(reward: DailyContractReward): string {
    switch (reward.type) {
      case 'points':
        return this.transloco.translate('contracts.rewards.points', {
          minutes: Math.max(1, Math.round(reward.value / 60)),
        });
      case 'multiplier':
        return this.transloco.translate('contracts.rewards.multiplier', {
          value: reward.value.toFixed(1),
          minutes: Math.max(1, Math.round((reward.durationSeconds ?? 0) / 60)),
        });
      case 'golden_croquetas':
        return this.transloco.translate('contracts.rewards.golden', {
          value: reward.value,
        });
    }
  }

  private getSortScore(contract: ActiveDailyContract): number {
    if (contract.claimed) {
      return 0;
    }
    if (this.isCompleted(contract)) {
      return 3;
    }
    return 1 + this.progressPercent(contract) / 100;
  }
}
