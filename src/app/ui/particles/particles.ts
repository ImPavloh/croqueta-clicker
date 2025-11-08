import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParticlesService, Particle } from '@services/particles.service';

@Component({
  selector: 'app-particles',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './particles.html',
  styleUrls: ['./particles.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Particles {
  constructor(public particlesService: ParticlesService) {}

  trackByUid(index: number, particle: Particle): number {
    return particle.uid;
  }
}
