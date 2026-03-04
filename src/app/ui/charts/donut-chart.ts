import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';

export interface DonutChartItem {
  name: string;
  value: number;
  percentage: number;
}

@Component({
  selector: 'app-donut-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="donut-container">
      @if (title()) {
        <p class="donut-title">{{ title() }}</p>
      }
      <div class="donut-layout">
        <svg [attr.viewBox]="'0 0 ' + size + ' ' + size" class="donut-svg">
          @for (segment of segments(); track segment.name) {
            <circle
              [attr.cx]="center"
              [attr.cy]="center"
              [attr.r]="radius"
              fill="none"
              [attr.stroke]="segment.color"
              [attr.stroke-width]="strokeWidth"
              [attr.stroke-dasharray]="segment.dashArray"
              [attr.stroke-dashoffset]="segment.dashOffset"
              stroke-linecap="round"
            />
          }
          <text
            [attr.x]="center"
            [attr.y]="center - 6"
            text-anchor="middle"
            dominant-baseline="middle"
            class="donut-center-text"
          >
            {{ centerLabel() }}
          </text>
          <text
            [attr.x]="center"
            [attr.y]="center + 14"
            text-anchor="middle"
            dominant-baseline="middle"
            class="donut-center-sub"
          >
            {{ centerSub() }}
          </text>
        </svg>
        <div class="donut-legend">
          @for (segment of segments(); track segment.name) {
            <div class="legend-item">
              <span class="legend-dot" [style.background]="segment.color"></span>
              <span class="legend-name">{{ segment.name }}</span>
              <span class="legend-pct">{{ segment.percentage }}%</span>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .donut-container {
        width: 100%;
      }
      .donut-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: #4b3b1b;
        text-align: center;
        margin-bottom: 12px;
      }
      .donut-layout {
        display: flex;
        align-items: center;
        gap: 20px;
        flex-wrap: wrap;
        justify-content: center;
      }
      .donut-svg {
        width: 180px;
        height: 180px;
        transform: rotate(-90deg);
        flex-shrink: 0;
      }
      .donut-center-text {
        font-size: 18px;
        font-weight: 700;
        fill: #4b3b1b;
        transform: rotate(90deg);
        transform-origin: center;
      }
      .donut-center-sub {
        font-size: 11px;
        fill: #8b7355;
        transform: rotate(90deg);
        transform-origin: center;
      }
      .donut-legend {
        display: flex;
        flex-direction: column;
        gap: 6px;
        max-height: 180px;
        overflow-y: auto;
      }
      .legend-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.8rem;
        color: #5c4a2a;
      }
      .legend-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .legend-name {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 120px;
      }
      .legend-pct {
        font-weight: 600;
        min-width: 40px;
        text-align: right;
      }
    `,
  ],
})
export class DonutChartComponent {
  data = input.required<DonutChartItem[]>();
  title = input<string>('');
  centerLabel = input<string>('');
  centerSub = input<string>('');

  readonly size = 200;
  readonly center = 100;
  readonly radius = 70;
  readonly strokeWidth = 28;
  readonly circumference = 2 * Math.PI * 70;

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

  segments = computed(() => {
    const items = this.data();
    const total = items.reduce((s, i) => s + i.value, 0);
    if (total === 0) return [];

    let offset = 0;
    return items.map((item, i) => {
      const pct = item.value / total;
      const dash = pct * this.circumference;
      const gap = this.circumference - dash;
      const seg = {
        name: item.name,
        color: this.COLORS[i % this.COLORS.length],
        dashArray: `${dash} ${gap}`,
        dashOffset: -offset,
        percentage: Math.round(pct * 1000) / 10,
      };
      offset += dash;
      return seg;
    });
  });
}
