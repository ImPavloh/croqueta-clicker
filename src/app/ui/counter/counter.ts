import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PointsService } from '../../services/points.service';
import { ShortNumberPipe } from '../../pipes/short-number.pipe';

@Component({
  selector: 'app-counter',
  imports: [CommonModule, ShortNumberPipe],
  templateUrl: './counter.html',
  styleUrl: './counter.css',
})
export class Counter {
  // inyecta servicio
  constructor(public pointsService: PointsService) {}
}
