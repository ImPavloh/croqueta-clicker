import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PointsService } from '../../services/points';

@Component({
  selector: 'app-clicker',
  imports: [ CommonModule ],
  templateUrl: './clicker.html',
  styleUrl: './clicker.css',
})
export class Clicker {
  constructor(public pointsService: PointsService) {}

  onClick() {
    this.pointsService.add();
    // guardar puntos tras cada click
    this.pointsService.saveToStorage();
  }

}
