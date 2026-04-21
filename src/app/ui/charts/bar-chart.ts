import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';

export interface BarChartItem {
  name: string;
  value: number;
}

@Component({
  selector: 'app-bar-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bar-chart-container">
      @if (title()) {
        <p class="chart-title">{{ title() }}</p>
      }
      <div class="bars-wrapper">
        @for (item of chartData(); track item.name) {
          <div class="bar-row">
            <div class="bar-meta">
              <span class="bar-label" [title]="item.name">{{ item.name }}</span>
              <span class="bar-value">{{ item.displayValue }}</span>
            </div>
            <div class="bar-track" [attr.aria-label]="item.name + ': ' + item.displayValue">
              <div
                class="bar-fill"
                [style.width.%]="item.widthPct"
                [style.background]="getColor($index)"
              ></div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .bar-chart-container {
        width: 100%;
      }
      .chart-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: #4b3b1b;
        text-align: center;
        margin-bottom: 12px;
      }
      .bars-wrapper {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .bar-row {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .bar-meta {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
      }
      .bar-label {
        font-size: 0.82rem;
        color: #5c4a2a;
        font-weight: 600;
        flex: 1;
        min-width: 0;
        line-height: 1.3;
        overflow-wrap: anywhere;
      }
      .bar-track {
        width: 100%;
        height: 18px;
        background: #f5e6c8;
        border-radius: 999px;
        position: relative;
        overflow: hidden;
        border: 1px solid #d4b896;
        box-shadow: inset 0 1px 2px rgba(75, 59, 27, 0.08);
      }
      .bar-fill {
        height: 100%;
        border-radius: inherit;
        transition: width 0.5s ease;
      }
      .bar-value {
        font-size: 0.75rem;
        font-weight: 600;
        color: #4b3b1b;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
        flex-shrink: 0;
      }

      @media (max-width: 640px) {
        .bar-meta {
          flex-direction: column;
          gap: 4px;
        }

        .bar-value {
          align-self: flex-end;
        }
      }
    `,
  ],
})
export class BarChartComponent {
  data = input.required<BarChartItem[]>();
  title = input<string>('');
  formatValue = input<(v: number) => string>((v) => v.toLocaleString());

  private readonly COLORS = [
    '#c4813d',
    '#8b6914',
    '#d4a44a',
    '#a67c40',
    '#6b8e23',
    '#cd853f',
    '#daa520',
    '#b8860b',
    '#8fbc8f',
    '#d2691e',
    '#bc8f8f',
    '#f4a460',
    '#b8860b',
    '#cd853f',
    '#d2b48c',
  ];

  chartData = computed(() => {
    const items = this.data();
    const max = Math.max(...items.map((i) => i.value), 1);
    const fmt = this.formatValue();
    return items.map((item) => ({
      name: item.name,
      widthPct: max > 0 ? Math.max(0, Math.min((item.value / max) * 100, 100)) : 0,
      displayValue: fmt(item.value),
    }));
  });

  getColor(index: number): string {
    return this.COLORS[index % this.COLORS.length];
  }
}
