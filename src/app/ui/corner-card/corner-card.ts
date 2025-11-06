import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-corner-card',
  imports: [NgClass],
  templateUrl: './corner-card.html',
  styleUrl: './corner-card.css',
})
export class CornerCard {
  // comportamiento
  type = input<'div' | 'button'>('div');

  // estados
  active = input<boolean>(false); // si está activo/seleccionado
  disabled = input<boolean>(false); // si está deshabilitado

  // interactividad
  clickable = input<boolean>(false); // si debe tener cursor pointer y efecto hover
  hoverable = input<boolean>(false); // si tiene efecto hover

  // apariencia
  showCorners = input<boolean>(true); // mostrar bordes decorativos en las esquinas
  showBorder = input<boolean>(true); // mostrar borde principal del card
  cornerStyle = input<'classic' | 'simple'>('classic'); // estilo de las esquinas

  // variantes
  variant = input<'default' | 'primary' | 'success' | 'warning' | 'danger'>('default');

  // tamaño
  size = input<'sm' | 'md' | 'lg'>('md');
}
