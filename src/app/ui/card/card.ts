import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-card',
  imports: [NgClass],
  templateUrl: './card.html',
  styleUrl: './card.css',
})
export class Card {
  // variantes
  variant = input<'default' | 'primary' | 'secondary'>('default');

  // tamaño
  size = input<'sm' | 'md' | 'lg'>('md');
}
