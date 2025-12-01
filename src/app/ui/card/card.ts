import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

/**
 * Componente de tarjeta reutilizable para agrupar contenido.
 * Soporta múltiples variantes visuales y tamaños.
 */
@Component({
  selector: 'app-card',
  standalone: true,
  imports: [NgClass],
  templateUrl: './card.html',
  styleUrl: './card.css',
})
export class Card {
  /** Variante visual de la tarjeta */
  variant = input<'default' | 'primary' | 'secondary'>('default');

  /** Tamaño de la tarjeta */
  size = input<'sm' | 'md' | 'lg'>('md');
}
