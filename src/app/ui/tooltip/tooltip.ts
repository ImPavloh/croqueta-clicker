import {
  Component,
  input,
  ElementRef,
  Renderer2,
  OnDestroy,
  ViewEncapsulation,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.html',
  styleUrl: './tooltip.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:scroll)': 'onWindowChange()',
    '(window:resize)': 'onWindowChange()',
  },
})
export class Tooltip implements OnDestroy {
  private static nextId = 0;

  text = input<string>('');
  position = input<'top' | 'bottom' | 'left' | 'right'>('bottom');
  disabled = input<boolean>(false);

  showTooltip = false;

  private tooltipEl?: HTMLElement;
  private host = inject(ElementRef<HTMLElement>);
  private renderer = inject(Renderer2);
  private describedElement?: HTMLElement;
  private readonly tooltipId = `cc-tooltip-${Tooltip.nextId++}`;

  onMouseEnter() {
    this.showTooltipNow();
  }

  onMouseLeave() {
    this.destroyTooltip();
  }

  onFocusIn() {
    this.showTooltipNow();
  }

  onFocusOut(event: FocusEvent) {
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Node && this.host.nativeElement.contains(nextTarget)) {
      return;
    }

    this.destroyTooltip();
  }

  onWindowChange() {
    if (this.tooltipEl) {
      this.updatePosition();
    }
  }

  ngOnDestroy(): void {
    this.destroyTooltip();
  }

  private showTooltipNow() {
    if (this.disabled() || !this.text()) return;
    this.showTooltip = true;
    this.createTooltip();
    this.attachAriaDescription();
    this.updatePosition();
  }

  private createTooltip() {
    if (this.tooltipEl) return;
    const el = this.renderer.createElement('div');
    this.renderer.addClass(el, 'tooltip');
    this.renderer.addClass(el, `tooltip-${this.position()}`);
    this.renderer.setAttribute(el, 'id', this.tooltipId);
    this.renderer.setAttribute(el, 'role', 'tooltip');
    this.renderer.setProperty(el, 'textContent', this.text());
    this.renderer.setStyle(el, 'pointerEvents', 'none');
    this.renderer.setStyle(el, 'position', 'fixed');
    this.renderer.setStyle(el, 'left', '0px');
    this.renderer.setStyle(el, 'top', '0px');
    this.renderer.appendChild(document.body, el);
    this.tooltipEl = el;
  }

  private destroyTooltip() {
    this.detachAriaDescription();

    if (!this.tooltipEl) return;
    try {
      this.renderer.removeChild(document.body, this.tooltipEl);
    } catch (e) {
      // ignorar
    }
    this.tooltipEl = undefined;
    this.showTooltip = false;
  }

  private updatePosition() {
    if (!this.tooltipEl) return;
    const hostRect = this.host.nativeElement.getBoundingClientRect();
    const tt = this.tooltipEl;

    this.renderer.setStyle(tt, 'transform', 'none');

    const ttRect = tt.getBoundingClientRect();
    const spacing = 8;

    let left = 0;
    let top = 0;

    if (this.position() === 'top') {
      left = hostRect.left + hostRect.width / 2 - ttRect.width / 2;
      top = hostRect.top - ttRect.height - spacing;
    } else if (this.position() === 'bottom') {
      left = hostRect.left + hostRect.width / 2 - ttRect.width / 2;
      top = hostRect.bottom + spacing;
    } else if (this.position() === 'left') {
      left = hostRect.left - ttRect.width - spacing;
      top = hostRect.top + hostRect.height / 2 - ttRect.height / 2;
    } else {
      left = hostRect.right + spacing;
      top = hostRect.top + hostRect.height / 2 - ttRect.height / 2;
    }

    const margin = 8;
    left = Math.max(margin, Math.min(left, window.innerWidth - ttRect.width - margin));
    top = Math.max(margin, Math.min(top, window.innerHeight - ttRect.height - margin));

    this.renderer.setStyle(tt, 'left', `${Math.round(left)}px`);
    this.renderer.setStyle(tt, 'top', `${Math.round(top)}px`);
  }

  private attachAriaDescription() {
    const activeElement = typeof document !== 'undefined' ? document.activeElement : null;
    const target =
      activeElement instanceof HTMLElement && this.host.nativeElement.contains(activeElement)
        ? activeElement
        : this.findFocusableTarget();

    if (!target) {
      return;
    }

    this.describedElement = target;
    const current = target.getAttribute('aria-describedby')?.trim();

    if (!current) {
      this.renderer.setAttribute(target, 'aria-describedby', this.tooltipId);
      return;
    }

    const ids = current.split(/\s+/);
    if (!ids.includes(this.tooltipId)) {
      this.renderer.setAttribute(target, 'aria-describedby', `${current} ${this.tooltipId}`);
    }
  }

  private detachAriaDescription() {
    const target = this.describedElement;
    this.describedElement = undefined;

    if (!target) {
      return;
    }

    const current = target.getAttribute('aria-describedby')?.trim();
    if (!current) {
      return;
    }

    const nextIds = current
      .split(/\s+/)
      .filter((id) => id && id !== this.tooltipId)
      .join(' ');

    if (nextIds) {
      this.renderer.setAttribute(target, 'aria-describedby', nextIds);
    } else {
      this.renderer.removeAttribute(target, 'aria-describedby');
    }
  }

  private findFocusableTarget(): HTMLElement | null {
    return this.host.nativeElement.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ) as HTMLElement | null;
  }
}
