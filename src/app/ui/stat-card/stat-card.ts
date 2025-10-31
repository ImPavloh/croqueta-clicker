import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
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
