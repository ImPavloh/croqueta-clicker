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
            <span class="bar-label" [title]="item.name">{{ item.name }}</span>
            <div class="bar-track">
              <div
                class="bar-fill"
                [style.width.%]="item.widthPct"
                [style.background]="getColor($index)"
              ></div>
              <span class="bar-value">{{ item.displayValue }}</span>
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
        gap: 8px;
      }
      .bar-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .bar-label {
        min-width: 100px;
        max-width: 120px;
        font-size: 0.82rem;
        color: #5c4a2a;
        text-align: right;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .bar-track {
        flex: 1;
        height: 24px;
        background: #f5e6c8;
        border-radius: 12px;
        position: relative;
        overflow: hidden;
        border: 1px solid #d4b896;
      }
      .bar-fill {
        height: 100%;
        border-radius: 12px;
        transition: width 0.5s ease;
        min-width: 2px;
      }
      .bar-value {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 0.75rem;
        font-weight: 600;
        color: #4b3b1b;
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
      widthPct: (item.value / max) * 100,
      displayValue: fmt(item.value),
    }));
  });

  getColor(index: number): string {
    return this.COLORS[index % this.COLORS.length];
  }
}
