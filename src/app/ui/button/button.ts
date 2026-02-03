import { Component, input, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AudioService } from '@services/audio.service';

/**
 * Componente de botón reutilizable con múltiples variantes y estilos.
 * Soporta integración con Angular Router y reproducción automática de sonido al hacer clic.
 */
@Component({
  selector: 'app-button',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './button.html',
  styleUrls: ['./button.css'],
  host: {
    '[class]': 'customClass()',
    '(click)': 'onClick($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  private audioService = inject(AudioService);

  /** Variante visual del botón */
  variant = input<
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'quaternary'
    | 'danger'
    | 'success'
    | 'warning'
    | 'nav'
    | 'control'
    | 'golden'
  >('primary');

  /** Indica si el botón está activo (para botones de navegación) */
  active = input(false);

  /** Habilita el efecto hover */
  hoverable = input(true);

  /** Indica si el botón es clickeable (afecta al cursor) */
  clickable = input(false);

  /** Deshabilita el botón */
  disabled = input(false);

  /** Tamaño del botón */
  size = input<'sm' | 'md' | 'lg' | 'xl' | undefined>(undefined);

  /** Tipo HTML del botón */
  type = input<'button' | 'submit' | 'reset'>('button');

  /** Ruta de Angular Router (si se usa como enlace) */
  routerLink = input<string | any[] | undefined>(undefined);

  /** Requiere coincidencia exacta de ruta para activarse */
  routerLinkActiveExact = input(false);

  /** Clases CSS personalizadas adicionales */
  customClass = input('');

  /** Desactiva el sonido de clic */
  noSound = input(false);

  /**
   * Maneja el evento de clic del botón.
   * Reproduce sonido y previene propagación si está deshabilitado.
   * @param event Evento de clic
   */
  onClick(event?: Event) {
    if (this.disabled()) {
      if (event?.preventDefault) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
      return;
    }

    if (!this.noSound()) {
      this.audioService.playSfx('/assets/sfx/click02.mp3', 1);
    }
  }
}
