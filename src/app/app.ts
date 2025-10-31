import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Navbar } from './ui/navbar/navbar';
import { Clicker } from './ui/clicker/clicker';
import { Counter } from './ui/counter/counter';
import { PointsService } from './services/points';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Clicker, Counter],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('croqueta-clicker');

  // splash control (visible al inicio)
  protected readonly splashShown = signal(true);

  // cargar puntos al iniciar la app
  constructor(points: PointsService) {
    points.loadFromStorage();
  }

  ngOnInit(): void {
    // ocultar splash automáticamente tras 2s
    if (typeof window !== 'undefined') {
      setTimeout(() => this.splashShown.set(false), 5000);
    }
  }

  protected hideSplash(): void {
    this.splashShown.set(false);
  }
}
