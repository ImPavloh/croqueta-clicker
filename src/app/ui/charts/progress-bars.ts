import { Component, input, ChangeDetectionStrategy } from '@angular/core';

export interface ProgressBarItem {
  label: string;
  current: number;
  total: number;
  percentage: number;
}

@Component({
  selector: 'app-progress-bars',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="progress-container">
      @if (title()) {
        <p class="progress-title">{{ title() }}</p>
      }
      <div class="progress-list">
        @for (item of data(); track item.label) {
          <div class="progress-row">
            <div class="progress-header">
              <span class="progress-label">{{ item.label }}</span>
              <span class="progress-count">{{ item.current }}/{{ item.total }}</span>
            </div>
            <div class="progress-track">
              <div
                class="progress-fill"
                [style.width.%]="clampPercentage(item.percentage)"
                [style.background]="getGradient(item.percentage)"
              ></div>
            </div>
            <span class="progress-pct">{{ item.percentage }}%</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .progress-container {
        width: 100%;
      }
      .progress-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: #4b3b1b;
        text-align: center;
        margin-bottom: 12px;
      }
      .progress-list {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .progress-row {
      }
      .progress-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 10px;
        flex-wrap: wrap;
        margin-bottom: 4px;
      }
      .progress-label {
        font-size: 0.9rem;
        font-weight: 600;
        color: #4b3b1b;
      }
      .progress-count {
        font-size: 0.82rem;
        color: #8b7355;
      }
      .progress-track {
        height: 20px;
        background: #f5e6c8;
        border-radius: 10px;
        overflow: hidden;
        border: 1px solid #d4b896;
      }
      .progress-fill {
        height: 100%;
        border-radius: 10px;
        transition: width 0.5s ease;
      }
      .progress-pct {
        display: block;
        text-align: right;
        font-size: 0.75rem;
        font-weight: 700;
        color: #6b5a3a;
        margin-top: 2px;
      }
    `,
  ],
})
export class ProgressBarsComponent {
  data = input.required<ProgressBarItem[]>();
  title = input<string>('');

  clampPercentage(value: number): number {
    return Math.max(0, Math.min(value, 100));
  }

  getGradient(pct: number): string {
    if (pct >= 100) return 'linear-gradient(90deg, #6b8e23, #8fbc8f)';
    if (pct >= 75) return 'linear-gradient(90deg, #daa520, #f4c542)';
    if (pct >= 50) return 'linear-gradient(90deg, #cd853f, #daa520)';
    if (pct >= 25) return 'linear-gradient(90deg, #c4813d, #d4a44a)';
    return 'linear-gradient(90deg, #b8860b, #c4813d)';
  }
}
