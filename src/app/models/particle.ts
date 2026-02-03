import { Sprite, Texture } from 'pixi.js';

/**
 * Clase Particle para V8 (Hidden Classes)
 */
export class Particle extends Sprite {
  // V8 crea una Hidden Class optimizada para esta forma exacta
  vx: number = 0;
  vy: number = 0;
  life: number = 0;
  maxLife: number = 1;
  rotationSpeed: number = 0;
  active: boolean = false;
  gravity: number = 300;

  // para partículas con sombra
  shadow: Sprite | null = null;

  constructor(texture: Texture) {
    super(texture);
    this.anchor.set(0.5);
    this.visible = false;
  }

  /**
   * reinicia la partícula para reutilización (CERO allocations)
   * evita crear objetos nuevos, solo muta propiedades existentes
   */
  reset(x: number, y: number, options?: ParticleResetOptions): void {
    this.x = x;
    this.y = y;
    this.life = options?.life ?? 1.0;
    this.maxLife = this.life;
    this.active = true;
    this.visible = true;
    this.alpha = options?.alpha ?? 1;
    this.vx = options?.vx ?? (Math.random() - 0.5) * 200;
    this.vy = options?.vy ?? (Math.random() - 0.5) * 200 - 100;
    this.rotationSpeed = options?.rotationSpeed ?? (Math.random() - 0.5) * 5;
    this.gravity = options?.gravity ?? 300;

    if (options?.scale !== undefined) {
      this.scale.set(options.scale);
    }
    if (options?.tint !== undefined) {
      this.tint = options.tint;
    }
  }

  /**
   * Actualiza la partícula (llamado desde el game loop)
   * Retorna boolean para evitar acceso a propiedad en el caller
   */
  tick(deltaTime: number): boolean {
    if (!this.active) return false;

    // Física - mutación directa sin crear objetos
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    this.vy += this.gravity * deltaTime;
    this.rotation += this.rotationSpeed * deltaTime;

    // Vida
    this.life -= deltaTime;
    const lifeRatio = this.life > 0 ? this.life / this.maxLife : 0;
    this.alpha = lifeRatio;

    // Desactivar si murió
    if (this.life <= 0) {
      this.deactivate();
      return false;
    }

    return true;
  }

  /**
   * Desactiva la partícula y la devuelve al pool virtual
   */
  deactivate(): void {
    this.active = false;
    this.visible = false;
  }
}

/**
 * Opciones para resetear una partícula
 * Usar interface en lugar de objeto literal para type-safety
 */
export interface ParticleResetOptions {
  life?: number;
  alpha?: number;
  vx?: number;
  vy?: number;
  rotationSpeed?: number;
  gravity?: number;
  scale?: number;
  tint?: number;
}

/**
 * Partícula de texto flotante optimizada
 */
export class FloatingTextParticle {
  // Propiedades estrictas para V8
  x: number = 0;
  y: number = 0;
  vx: number = 0;
  vy: number = 0;
  life: number = 0;
  maxLife: number = 1;
  active: boolean = false;
  text: string = '';

  reset(x: number, y: number, text: string): void {
    this.x = x;
    this.y = y;
    this.text = text;
    this.vx = 0;
    this.vy = -53;
    this.life = 0.9;
    this.maxLife = 0.9;
    this.active = true;
  }

  tick(deltaTime: number): boolean {
    if (!this.active) return false;

    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    this.life -= deltaTime;

    if (this.life <= 0) {
      this.active = false;
      return false;
    }

    return true;
  }

  getAlpha(): number {
    const progress = 1 - this.life / this.maxLife;
    return progress < 0.7 ? 1 : 1 - (progress - 0.7) / 0.3;
  }
}
