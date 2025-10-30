import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PointsService } from '../../services/points';
import { Floating } from '../floating/floating';

@Component({
  selector: 'app-clicker',
  imports: [CommonModule, Floating],
  templateUrl: './clicker.html',
  styleUrl: './clicker.css',
})
export class Clicker {
  constructor(public pointsService: PointsService) {}

  onClick() {
    this.pointsService.addPointsPerClick();
    // guardar puntos tras cada click
    this.pointsService.saveToStorage();
  }

  preventKey(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
    }
  }
}
