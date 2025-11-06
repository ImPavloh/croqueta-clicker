import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CornerCard } from '@ui/corner-card/corner-card';

export interface StatCardConfig {
  title: string;
  value: number | string;
  description?: string;
  icon?: string;
  format?: 'number' | 'percentage' | 'currency' | 'time';
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
  @Input() loading: boolean = false;

  formatTime(value: number | string): string {
    const seconds = Number(value)
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
