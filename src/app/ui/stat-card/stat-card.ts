import { STATS } from './../../data/stats.data';
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CornerCard } from '@ui/corner-card/corner-card';

export interface StatCardConfig {
  id: string;                // identificador único
  title: string;             // título mostrado
  key: string;               // referencia al valor en PlayerStats
  icon: string;              // nombre del icono
  format: 'number' | 'percentage' | 'time';
  description?: string;      // texto opcional para tooltip o ayuda
}

@Component({
  standalone: true,
  selector: 'app-stat-card',
  imports: [CommonModule, CornerCard],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.css',
})

export class StatCardComponent {
  @Input() config!: StatCardConfig;
  @Input() value: number = 0;
  @Input() loading: boolean = false;


  formatTime(value: number | string): string {
    const seconds = Number(value)
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
