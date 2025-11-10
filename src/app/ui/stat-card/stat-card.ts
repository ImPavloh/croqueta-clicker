import { Component, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CornerCard } from '@ui/corner-card/corner-card';
import { StatModel } from 'app/models/stat.model';



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

//Añade un 0 si el número es menor a 10
pad(v: number) { return v.toString().padStart(2, '0'); }

formatTime(v: number | string) {
  const s = Number(v);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;

  return d > 0
    ? `${d}d ${this.pad(h)}:${this.pad(m)}:${this.pad(sec)}`
    : h > 0
    ? `${h}:${this.pad(m)}:${this.pad(sec)}`
    : `${this.pad(m)}:${this.pad(sec)}`;
}
}
