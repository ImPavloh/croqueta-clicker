import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tooltip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tooltip.html',
  styleUrl: './tooltip.css',
})
export class Tooltip {
  @Input() text: string = '';
  @Input() position: 'top' | 'bottom' | 'left' | 'right' = 'bottom';
  @Input() disabled: boolean = false;

  showTooltip = false;

  onMouseEnter() {
    if (!this.disabled && this.text) {
      this.showTooltip = true;
    }
  }

  onMouseLeave() {
    this.showTooltip = false;
  }
}
