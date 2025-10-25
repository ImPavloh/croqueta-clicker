import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PointsService } from '../../services/points';

@Component({
  selector: 'app-counter',
  imports: [ CommonModule ],
  templateUrl: './counter.html',
  styleUrl: './counter.css',
})
export class Counter {
  // inyecta servicio
  constructor(public pointsService: PointsService) {}
}
