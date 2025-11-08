import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CornerCard } from '@ui/corner-card/corner-card';
import { StatModel } from 'app/models/stat-model';



@Component({
  standalone: true,
  selector: 'app-stat-card',
  imports: [CommonModule, CornerCard],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.css',
})

export class StatCardComponent {
  @Input() config!: StatModel;
  @Input() value: number = 0;
  @Input() loading: boolean = false;


  formatTime(value: number | string): string {
    const seconds = Number(value)
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
