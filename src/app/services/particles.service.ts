import { Injectable, signal } from '@angular/core';

export interface Particle {
  uid: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  duration: number;
  type: 'circle' | 'croqueta' | 'custom';
  rotation: number;
  image?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ParticlesService {
  private _particles = signal<Particle[]>([]);
  readonly particles = this._particles.asReadonly();

  private lastId = 0;
  private readonly maxParticles = this.getMaxParticles();

  constructor() {}

  private getMaxParticles(): number {
    if (typeof window === 'undefined') return 50;

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isLowEnd = navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 4 : false;

    if (isMobile) return 30;
    if (isLowEnd) return 50;
    return 75;
  }

  // crear partículas desde una posición específica
  spawn(x: number, y: number, count: number = 8) {
    // limitar partículas activas para evitar lag (importante xD) ~ sobretodo como se haga spam de clics
    if (this._particles().length >= this.maxParticles) {
      return;
    }

    const adjustedCount = this.maxParticles <= 30 ? Math.min(count, 4) : count;

    const particles: Particle[] = [];
    const colors = ['#FFD700', '#FFA500', '#FF8C00', '#FFFFE0', '#FFF8DC'];

    for (let i = 0; i < adjustedCount; i++) {
      const uid = ++this.lastId;
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 3;

      const particle: Particle = {
        uid,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 6,
        duration: 600 + Math.random() * 400,
        type: 'circle',
        rotation: 0,
      };

      particles.push(particle);

      // eliminar partícula después de su duración
      setTimeout(() => {
        this._particles.update((arr) => arr.filter((p) => p.uid !== uid));
      }, particle.duration);
    }

    this._particles.update((arr) => [...arr, ...particles]);
  }

  // crear partículas de croquetas cayendo desde arriba
  spawnFallingCroquetas(containerWidth: number, count: number = 5, customImage?: string) {
    // lo mismo de antes, limitar particulas activas
    if (this._particles().length >= this.maxParticles) {
      return;
    }

    const adjustedCount = this.maxParticles <= 30 ? Math.min(count, 2) : count;

    const particles: Particle[] = [];

    for (let i = 0; i < adjustedCount; i++) {
      const uid = ++this.lastId;
      const x = Math.random() * containerWidth;
      const y = -50;

      const particle: Particle = {
        uid,
        x,
        y,
        vx: (Math.random() - 0.5) * 0.5,
        vy: 3 + Math.random() * 2,
        color: '',
        size: 30 + Math.random() * 20,
        duration: 1500 + Math.random() * 500,
        type: 'custom',
        rotation: Math.random() * 360,
        image: customImage,
      };

      particles.push(particle);

      // eliminar partícula después de su duración
      setTimeout(() => {
        this._particles.update((arr) => arr.filter((p) => p.uid !== uid));
      }, particle.duration);
    }

    this._particles.update((arr) => [...arr, ...particles]);
  }

  // limpiar todas las partículas
  clear() {
    this._particles.set([]);
  }
}
