import {
  Component,
  Input,
  ElementRef,
  Renderer2,
  OnDestroy,
  HostListener,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tooltip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tooltip.html',
  styleUrl: './tooltip.css',
  encapsulation: ViewEncapsulation.None,
})
export class Tooltip implements OnDestroy {
  @Input() text: string = '';
  @Input() position: 'top' | 'bottom' | 'left' | 'right' = 'bottom';
  @Input() disabled: boolean = false;

  showTooltip = false;

  private tooltipEl?: HTMLElement;

  constructor(private host: ElementRef<HTMLElement>, private renderer: Renderer2) {}

  onMouseEnter() {
    if (this.disabled || !this.text) return;
    this.showTooltip = true;
    this.createTooltip();
    this.updatePosition();
  }

  onMouseLeave() {
    this.destroyTooltip();
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onWindowChange() {
    if (this.tooltipEl) {
      this.updatePosition();
    }
  }

  ngOnDestroy(): void {
    this.destroyTooltip();
  }

  private createTooltip() {
    if (this.tooltipEl) return;
    const el = this.renderer.createElement('div');
    this.renderer.addClass(el, 'tooltip');
    this.renderer.addClass(el, `tooltip-${this.position}`);
    this.renderer.setProperty(el, 'textContent', this.text);
    this.renderer.setStyle(el, 'pointerEvents', 'none');
    this.renderer.setStyle(el, 'position', 'fixed');
    this.renderer.setStyle(el, 'left', '0px');
    this.renderer.setStyle(el, 'top', '0px');
    this.renderer.appendChild(document.body, el);
    this.tooltipEl = el;
  }

  private destroyTooltip() {
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

    if (this.position === 'top') {
      left = hostRect.left + hostRect.width / 2 - ttRect.width / 2;
      top = hostRect.top - ttRect.height - spacing;
    } else if (this.position === 'bottom') {
      left = hostRect.left + hostRect.width / 2 - ttRect.width / 2;
      top = hostRect.bottom + spacing;
    } else if (this.position === 'left') {
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
}
