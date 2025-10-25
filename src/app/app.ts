import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Navbar } from './ui/navbar/navbar';
import { Clicker } from './ui/clicker/clicker';
import { Counter } from './ui/counter/counter';
import { PointsService } from './services/points';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Clicker, Counter],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('croqueta-clicker');

  // cargar puntos al iniciar la app
  constructor(points: PointsService) {
    points.loadFromStorage();
  }
}
