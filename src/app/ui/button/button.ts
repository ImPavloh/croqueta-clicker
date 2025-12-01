import { Component, Input, inject } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AudioService } from '@services/audio.service';

/**
 * Componente de botón reutilizable con múltiples variantes y estilos.
 * Soporta integración con Angular Router y reproducción automática de sonido al hacer clic.
 */
@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './button.html',
  styleUrls: ['./button.css'],
  host: {
    '[class]': 'customClass',
    '(click)': 'onClick($event)',
  },
})
export class ButtonComponent {
  private audioService = inject(AudioService);

  /** Variante visual del botón */
  @Input() variant:
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'quaternary'
    | 'danger'
    | 'success'
    | 'warning'
    | 'nav'
    | 'control'
    | 'golden' = 'primary';

  /** Indica si el botón está activo (para botones de navegación) */
  @Input() active: boolean = false;

  /** Habilita el efecto hover */
  @Input() hoverable: boolean = true;

  /** Indica si el botón es clickeable (afecta al cursor) */
  @Input() clickable: boolean = false;

  /** Deshabilita el botón */
  @Input() disabled: boolean = false;

  /** Tamaño del botón */
  @Input() size?: 'sm' | 'md' | 'lg' | 'xl';

  /** Tipo HTML del botón */
  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  /** Ruta de Angular Router (si se usa como enlace) */
  @Input() routerLink?: string | any[];

  /** Requiere coincidencia exacta de ruta para activarse */
  @Input() routerLinkActiveExact: boolean = false;

  /** Clases CSS personalizadas adicionales */
  @Input() customClass: string = '';

  /** Desactiva el sonido de clic */
  @Input() noSound: boolean = false;

  /**
   * Maneja el evento de clic del botón.
   * Reproduce sonido y previene propagación si está deshabilitado.
   * @param event Evento de clic
   */
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
