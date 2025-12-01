import { Injectable, signal } from '@angular/core';

/**
 * Interfaz que define la estructura de una partícula visual.
 */
export interface Particle {
  /** Identificador único de la partícula */
  uid: number;
  /** Posición X en píxeles */
  x: number;
  /** Posición Y en píxeles */
  y: number;
  /** Velocidad horizontal */
  vx: number;
  /** Velocidad vertical */
  vy: number;
  /** Color de la partícula (para tipo 'circle') */
  color: string;
  /** Tamaño en píxeles */
  size: number;
  /** Duración de la animación en milisegundos */
  duration: number;
  /** Tipo de partícula a renderizar */
  type: 'circle' | 'croqueta' | 'custom';
  /** Rotación en grados */
  rotation: number;
  /** Ruta de la imagen (para tipos 'croqueta' o 'custom') */
  image?: string;
}

/**
 * Servicio para gestionar efectos de partículas en el juego.
 * Controla el spawn, animación y limpieza de partículas visuales.
 */
@Injectable({
  providedIn: 'root',
})
export class ParticlesService {
  /** Signal privado que contiene todas las partículas activas */
  private _particles = signal<Particle[]>([]);

  /** Signal público de solo lectura con las partículas activas */
  readonly particles = this._particles.asReadonly();

  /** Contador para asignar IDs únicos a cada partícula */
  private lastId = 0;

  /** Número máximo de partículas activas simultáneas */
  private readonly maxParticles = this.getMaxParticles();

  constructor() {}

  /**
   * Calcula el número máximo de partículas basado en el dispositivo.
   * Reduce el límite en dispositivos móviles o de bajo rendimiento.
   * @returns Número máximo de partículas permitidas
   */
  private getMaxParticles(): number {
    if (typeof window === 'undefined') return 50;

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    const isLowEnd = navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 4 : false;

    if (isMobile) return 30;
    if (isLowEnd) return 50;
    return 75;
  }

  /**
   * Crea partículas circulares desde una posición específica.
   * Las partículas se dispersan en todas las direcciones.
   * @param x Posición X inicial en píxeles
   * @param y Posición Y inicial en píxeles
   * @param count Número de partículas a crear (por defecto 8)
   */
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

  /**
   * Crea partículas con imagen de croqueta que caen desde arriba.
   * Usado para efectos visuales especiales.
   * @param containerWidth Ancho del contenedor para distribuir las partículas
   * @param count Número de partículas a crear (por defecto 5)
   * @param customImage Ruta opcional de imagen personalizada
   */
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

  /**
   * Elimina todas las partículas activas inmediatamente.
   */
  clear() {
    this._particles.set([]);
  }
}
