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
        <div class="donut-stage">
          <svg [attr.viewBox]="'0 0 ' + size + ' ' + size" class="donut-svg">
            <g [attr.transform]="'rotate(-90 ' + center + ' ' + center + ')'">
              <circle
                [attr.cx]="center"
                [attr.cy]="center"
                [attr.r]="radius"
                fill="none"
                stroke="#ead9b6"
                [attr.stroke-width]="strokeWidth"
              />
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
                  stroke-linecap="butt"
                  class="donut-segment"
                />
              }
            </g>
            <circle
              class="donut-core"
              [attr.cx]="center"
              [attr.cy]="center"
              [attr.r]="innerRadius"
            ></circle>
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
              [attr.y]="center + 16"
              text-anchor="middle"
              dominant-baseline="middle"
              class="donut-center-sub"
            >
              {{ centerSub() }}
            </text>
          </svg>
        </div>
        <div class="donut-legend">
          @for (segment of segments(); track segment.name) {
            <div class="legend-item">
              <span class="legend-dot" [style.background]="segment.color"></span>
              <span class="legend-name">{{ segment.name }}</span>
              <span class="legend-value">{{ segment.valueLabel }}</span>
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
        display: grid;
        grid-template-columns: minmax(200px, 240px) minmax(0, 1fr);
        align-items: center;
        gap: 20px;
      }
      .donut-stage {
        display: grid;
        place-items: center;
        border: 1px solid rgba(184, 156, 90, 0.28);
        border-radius: 18px;
        padding: 14px;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.4), rgba(255, 248, 232, 0.95));
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.55);
      }
      .donut-svg {
        width: 100%;
        max-width: 210px;
        aspect-ratio: 1;
        justify-self: center;
        overflow: visible;
      }
      .donut-segment {
        transition:
          stroke-dasharray 0.35s ease,
          stroke-dashoffset 0.35s ease;
      }
      .donut-core {
        fill: #fff8e8;
        stroke: rgba(184, 156, 90, 0.28);
        stroke-width: 1.5;
      }
      .donut-center-text {
        font-size: clamp(14px, 1.8vw, 18px);
        font-weight: 700;
        fill: #4b3b1b;
      }
      .donut-center-sub {
        font-size: clamp(10px, 1.2vw, 11px);
        fill: #8b7355;
      }
      .donut-legend {
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-width: 0;
      }
      .legend-item {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto auto;
        align-items: center;
        gap: 8px;
        font-size: 0.8rem;
        color: #5c4a2a;
        padding: 6px 8px;
        border-radius: 10px;
        background: rgba(255, 248, 232, 0.8);
        border: 1px solid rgba(212, 184, 150, 0.7);
      }
      .legend-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .legend-name {
        min-width: 0;
        overflow-wrap: anywhere;
      }
      .legend-value {
        color: #8b7355;
        font-size: 0.75rem;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }
      .legend-pct {
        font-weight: 600;
        min-width: 48px;
        text-align: right;
        font-variant-numeric: tabular-nums;
      }

      @media (max-width: 640px) {
        .donut-layout {
          grid-template-columns: 1fr;
        }
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
  readonly radius = 66;
  readonly strokeWidth = 22;
  readonly innerRadius = 52;
  readonly circumference = 2 * Math.PI * this.radius;

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
        valueLabel: item.value.toLocaleString(),
      };
      offset += dash;
      return seg;
    });
  });
}
