import { Component, input, ChangeDetectionStrategy } from '@angular/core';

/**
 * Componente de tarjeta reutilizable para agrupar contenido.
 * Soporta múltiples variantes visuales y tamaños.
 */
@Component({
  selector: 'app-card',
  templateUrl: './card.html',
  styleUrl: './card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Card {
  /** Variante visual de la tarjeta */
  variant = input<'default' | 'primary' | 'secondary'>('default');

  /** Tamaño de la tarjeta */
  size = input<'sm' | 'md' | 'lg'>('md');
}
