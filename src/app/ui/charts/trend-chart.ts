import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export interface TrendChartItem {
  name: string;
  value: number;
}

@Component({
  selector: 'app-trend-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="trend-chart">
      @if (title()) {
        <div class="trend-header">
          <p class="trend-title">{{ title() }}</p>
          @if (subtitle()) {
            <p class="trend-subtitle">{{ subtitle() }}</p>
          }
        </div>
      }

      @if (points().length > 0) {
        <div class="trend-stage">
          <svg
            class="trend-svg"
            [attr.viewBox]="'0 0 ' + svgWidth + ' ' + svgHeight"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient [attr.id]="gradientId" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#b86715" stop-opacity="0.35"></stop>
                <stop offset="100%" stop-color="#b86715" stop-opacity="0.04"></stop>
              </linearGradient>
            </defs>

            @for (tick of yTicks(); track tick.value) {
              <line
                class="trend-grid"
                [attr.x1]="paddingLeft"
                [attr.x2]="svgWidth - paddingRight"
                [attr.y1]="tick.y"
                [attr.y2]="tick.y"
              />
              <text
                class="trend-axis-label trend-axis-label--y"
                [attr.x]="paddingLeft - 10"
                [attr.y]="tick.y + 4"
              >
                {{ formatValue()(tick.value) }}
              </text>
            }

            @if (variant() === 'area') {
              <path
                class="trend-area"
                [attr.d]="areaPath()"
                [attr.fill]="'url(#' + gradientId + ')'"
              ></path>
            }

            <path class="trend-line" [attr.d]="linePath()"></path>

            @for (point of visibleDots(); track point.name + point.x) {
              <circle class="trend-dot" [attr.cx]="point.x" [attr.cy]="point.y" r="4"></circle>
            }

            @for (label of xLabels(); track label.index) {
              <line
                class="trend-tick"
                [attr.x1]="label.x"
                [attr.x2]="label.x"
                [attr.y1]="svgHeight - paddingBottom"
                [attr.y2]="svgHeight - paddingBottom + 6"
              />
              <text
                class="trend-axis-label trend-axis-label--x"
                [attr.x]="label.x"
                [attr.y]="svgHeight - paddingBottom + 22"
                text-anchor="middle"
              >
                {{ label.text }}
              </text>
            }
          </svg>
        </div>

        <div class="trend-summary">
          <div class="trend-pill">
            <span class="trend-pill-label">{{ startLabel() }}</span>
            <strong>{{ formatValue()(startValue()) }}</strong>
          </div>
          <div class="trend-pill trend-pill--accent">
            <span class="trend-pill-label">{{ peakLabel() }}</span>
            <strong>{{ formatValue()(peakValue()) }}</strong>
          </div>
          <div class="trend-pill">
            <span class="trend-pill-label">{{ endLabel() }}</span>
            <strong>{{ formatValue()(endValue()) }}</strong>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .trend-chart {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .trend-header {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .trend-title {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 700;
        color: #4b3b1b;
      }

      .trend-subtitle {
        margin: 0;
        color: #8b7355;
        font-size: 0.8rem;
        line-height: 1.4;
      }

      .trend-stage {
        border: 1px solid rgba(184, 156, 90, 0.35);
        border-radius: 16px;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.35), rgba(255, 248, 232, 0.9)),
          linear-gradient(135deg, #fff8e8, #f5e6c8);
        padding: 10px 10px 6px;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.55);
      }

      .trend-svg {
        width: 100%;
        height: auto;
        display: block;
      }

      .trend-grid {
        stroke: rgba(184, 156, 90, 0.22);
        stroke-width: 1;
        stroke-dasharray: 4 6;
      }

      .trend-line {
        fill: none;
        stroke: #b86715;
        stroke-width: 3;
        stroke-linejoin: round;
        stroke-linecap: round;
        filter: drop-shadow(0 2px 5px rgba(184, 103, 21, 0.22));
      }

      .trend-area {
        stroke: none;
      }

      .trend-dot {
        fill: #fff8e8;
        stroke: #b86715;
        stroke-width: 2;
      }

      .trend-tick {
        stroke: rgba(75, 59, 27, 0.35);
        stroke-width: 1;
      }

      .trend-axis-label {
        fill: #8b7355;
        font-size: 11px;
        font-weight: 600;
      }

      .trend-axis-label--y {
        text-anchor: end;
      }

      .trend-summary {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px;
      }

      .trend-pill {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 10px 12px;
        border-radius: 12px;
        border: 1px solid rgba(184, 156, 90, 0.28);
        background: linear-gradient(135deg, rgba(255, 248, 232, 0.95), rgba(243, 226, 194, 0.85));
        color: #4b3b1b;
      }

      .trend-pill--accent {
        border-color: rgba(184, 103, 21, 0.35);
        box-shadow: 0 4px 10px rgba(184, 103, 21, 0.1);
      }

      .trend-pill-label {
        font-size: 0.72rem;
        color: #8b7355;
      }

      .trend-pill strong {
        line-height: 1.2;
        font-variant-numeric: tabular-nums;
      }

      @media (max-width: 640px) {
        .trend-summary {
          grid-template-columns: 1fr;
        }

        .trend-stage {
          padding-inline: 6px;
        }

        .trend-axis-label {
          font-size: 10px;
        }
      }
    `,
  ],
})
export class TrendChartComponent {
  private static nextGradientId = 0;

  data = input.required<TrendChartItem[]>();
  title = input<string>('');
  subtitle = input<string>('');
  variant = input<'line' | 'area'>('line');
  scale = input<'linear' | 'log'>('linear');
  formatValue = input<(value: number) => string>((value) => value.toLocaleString());
  gradientId = `trendAreaFill-${TrendChartComponent.nextGradientId++}`;

  readonly svgWidth = 640;
  readonly svgHeight = 280;
  readonly paddingTop = 18;
  readonly paddingRight = 12;
  readonly paddingBottom = 48;
  readonly paddingLeft = 54;

  private readonly plotWidth = this.svgWidth - this.paddingLeft - this.paddingRight;
  private readonly plotHeight = this.svgHeight - this.paddingTop - this.paddingBottom;

  private readonly positiveDomain = computed(() => {
    const positiveValues = this.data()
      .map((item) => item.value)
      .filter((value) => value > 0);

    const min = positiveValues.length > 0 ? Math.min(...positiveValues) : 1;
    const max = positiveValues.length > 0 ? Math.max(...positiveValues) : 1;

    return { min, max };
  });

  private readonly normalizeValue = (value: number): number => {
    if (this.scale() !== 'log') {
      const maxValue = Math.max(...this.data().map((item) => item.value), 1);
      return Math.max(value, 0) / maxValue;
    }

    const domain = this.positiveDomain();
    const safeValue = Math.max(value, domain.min);
    const logMin = Math.log10(domain.min);
    const logMax = Math.log10(domain.max);
    const logValue = Math.log10(safeValue);

    if (logMax === logMin) return 1;
    return (logValue - logMin) / (logMax - logMin);
  };

  private readonly denormalizeValue = (ratio: number): number => {
    if (this.scale() !== 'log') {
      const maxValue = Math.max(...this.data().map((item) => item.value), 1);
      return maxValue * ratio;
    }

    const domain = this.positiveDomain();
    const logMin = Math.log10(domain.min);
    const logMax = Math.log10(domain.max);
    return Math.pow(10, logMin + (logMax - logMin) * ratio);
  };

  points = computed(() => {
    const items = this.data();
    const stepX = items.length > 1 ? this.plotWidth / (items.length - 1) : 0;

    return items.map((item, index) => ({
      ...item,
      x:
        items.length === 1
          ? this.paddingLeft + this.plotWidth / 2
          : this.paddingLeft + stepX * index,
      y: this.paddingTop + this.plotHeight - this.normalizeValue(item.value) * this.plotHeight,
    }));
  });

  linePath = computed(() => {
    const points = this.points();
    return points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ');
  });

  areaPath = computed(() => {
    const points = this.points();
    if (points.length === 0) return '';

    const baseline = this.paddingTop + this.plotHeight;
    const first = points[0];
    const last = points[points.length - 1];

    return [
      `M ${first.x} ${baseline}`,
      ...points.map((point) => `L ${point.x} ${point.y}`),
      `L ${last.x} ${baseline}`,
      'Z',
    ].join(' ');
  });

  yTicks = computed(() => {
    const tickCount = 4;

    return Array.from({ length: tickCount + 1 }, (_, index) => {
      const ratio = index / tickCount;
      const normalized = 1 - ratio;
      const value = this.denormalizeValue(normalized);
      return {
        value: Math.round(value * 10) / 10,
        y: this.paddingTop + this.plotHeight * ratio,
      };
    });
  });

  xLabels = computed(() => {
    const points = this.points();
    if (points.length <= 6) {
      return points.map((point, index) => ({ index, x: point.x, text: point.name }));
    }

    const stride = Math.ceil((points.length - 1) / 5);
    return points
      .map((point, index) => ({ index, x: point.x, text: point.name }))
      .filter(
        (point) =>
          point.index === 0 || point.index === points.length - 1 || point.index % stride === 0,
      );
  });

  visibleDots = computed(() => {
    const points = this.points();
    if (points.length <= 14) return points;

    const labelIndexes = new Set(this.xLabels().map((label) => label.index));
    return points.filter((_, index) => labelIndexes.has(index));
  });

  startLabel = computed(() => this.data()[0]?.name ?? '');
  startValue = computed(() => this.data()[0]?.value ?? 0);

  peakLabel = computed(() => {
    const peak = this.data().reduce<TrendChartItem | null>((best, item) => {
      if (!best || item.value > best.value) return item;
      return best;
    }, null);
    return peak?.name ?? '';
  });

  peakValue = computed(() => {
    const peak = this.data().reduce<TrendChartItem | null>((best, item) => {
      if (!best || item.value > best.value) return item;
      return best;
    }, null);
    return peak?.value ?? 0;
  });

  endLabel = computed(() => this.data()[this.data().length - 1]?.name ?? '');
  endValue = computed(() => this.data()[this.data().length - 1]?.value ?? 0);
}
