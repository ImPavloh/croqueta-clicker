import { Component, Input, inject } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AudioService } from '@services/audio.service';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, NgIf, RouterLink, RouterLinkActive],
  templateUrl: './button.html',
  styleUrls: ['./button.css'],
  host: {
    '[class]': 'customClass',
    '(click)': 'onClick($event)',
  },
})
export class ButtonComponent {
  private audioService = inject(AudioService);

  @Input() variant:
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'quaternary'
    | 'danger'
    | 'success'
    | 'warning'
    | 'nav'
    | 'control' = 'primary';
  @Input() active: boolean = false;
  @Input() hoverable: boolean = true;
  @Input() clickable: boolean = false;
  @Input() disabled: boolean = false;
  @Input() size?: 'sm' | 'md' | 'lg' | 'xl';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() routerLink?: string | any[];
  @Input() routerLinkActiveExact: boolean = false;
  @Input() customClass: string = '';
  @Input() noSound: boolean = false;

  onClick(event?: Event) {
    if (this.disabled) {
      if (event?.preventDefault) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
      return;
    }

    if (!this.noSound) {
      this.audioService.playSfx('/assets/sfx/click02.mp3', 1);
    }
  }
}
