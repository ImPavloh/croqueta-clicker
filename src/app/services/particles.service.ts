import { Injectable, signal, OnDestroy } from '@angular/core';

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
  /** Timestamp de creación para calcular expiración */
  startTime: number;
}

/**
 * Servicio para gestionar efectos de partículas en el juego.
 * Controla el spawn, animación y limpieza de partículas visuales.
 */
@Injectable({
  providedIn: 'root',
})
export class ParticlesService implements OnDestroy {
  /** Signal privado que contiene todas las partículas activas */
  private _particles = signal<Particle[]>([]);

  /** Signal público de solo lectura con las partículas activas */
  readonly particles = this._particles.asReadonly();

  /** Contador para asignar IDs únicos a cada partícula */
  private lastId = 0;

  /** Número máximo de partículas activas simultáneas */
  private readonly maxParticles = this.getMaxParticles();

  /** Pool de partículas reutilizables para reducir GC */
  private deadPool: Particle[] = [];

  private cleanupIntervalId?: any;

  constructor() {
    // Iniciar bucle de limpieza batched (cada 500ms es suficiente para borrar)
    if (typeof window !== 'undefined') {
      this.cleanupIntervalId = setInterval(() => this.cleanup(), 500);
    }
  }

  ngOnDestroy() {
    if (this.cleanupIntervalId) {
      clearInterval(this.cleanupIntervalId);
    }
  }

  /**
   * Calcula el número máximo de partículas basado en el dispositivo.
   * Reduce el límite en dispositivos móviles o de bajo rendimiento.
   * @returns Número máximo de partículas permitidas
   */
  private getMaxParticles(): number {
    if (typeof window === 'undefined') return 25;

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
    const isLowEnd = navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 4 : false;
    const isVeryLowEnd = navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 2 : false;

    if (isVeryLowEnd || (isMobile && isLowEnd)) return 12;
    if (isMobile) return 20;
    if (isLowEnd) return 30;
    return 40;
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

    const adjustedCount =
      this.maxParticles <= 20
        ? Math.min(count, 2)
        : this.maxParticles <= 30
          ? Math.min(count, 3)
          : count;

    const particles: Particle[] = [];
    const colors = ['#FFD700', '#FFA500', '#FF8C00', '#FFFFE0', '#FFF8DC'];
    const now = Date.now();

    for (let i = 0; i < adjustedCount; i++) {
      const angle = (Math.PI * 2 * i) / adjustedCount + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 3;
      let particle: Particle;

      // Reutilizar del pool si es posible
      if (this.deadPool.length > 0) {
        particle = this.deadPool.pop()!;
        // Reset properties
        particle.uid = ++this.lastId;
        particle.x = x;
        particle.y = y;
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed;
        particle.color = colors[Math.floor(Math.random() * colors.length)];
        particle.size = 4 + Math.random() * 6;
        particle.duration = 600 + Math.random() * 400;
        particle.type = 'circle';
        particle.rotation = 0;
        particle.image = undefined;
        particle.startTime = now;
      } else {
        // Crear nueva si el pool está vacío
        particle = {
          uid: ++this.lastId,
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 4 + Math.random() * 6,
          duration: 600 + Math.random() * 400,
          type: 'circle',
          rotation: 0,
          startTime: now,
        };
      }

      particles.push(particle);
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

    const adjustedCount =
      this.maxParticles <= 20
        ? Math.min(count, 1)
        : this.maxParticles <= 30
          ? Math.min(count, 2)
          : count;

    const particles: Particle[] = [];
    const now = Date.now();

    for (let i = 0; i < adjustedCount; i++) {
      let particle: Particle;

      if (this.deadPool.length > 0) {
        particle = this.deadPool.pop()!;
        particle.uid = ++this.lastId;
        particle.x = Math.random() * containerWidth;
        particle.y = -50;
        particle.vx = (Math.random() - 0.5) * 0.5;
        particle.vy = 3 + Math.random() * 2;
        particle.color = '';
        particle.size = 30 + Math.random() * 20;
        particle.duration = 1500 + Math.random() * 500;
        particle.type = 'custom';
        particle.rotation = Math.random() * 360;
        particle.image = customImage;
        particle.startTime = now;
      } else {
        particle = {
          uid: ++this.lastId,
          x: Math.random() * containerWidth,
          y: -50,
          vx: (Math.random() - 0.5) * 0.5,
          vy: 3 + Math.random() * 2,
          color: '',
          size: 30 + Math.random() * 20,
          duration: 1500 + Math.random() * 500,
          type: 'custom',
          rotation: Math.random() * 360,
          image: customImage,
          startTime: now,
        };
      }

      particles.push(particle);
    }

    this._particles.update((arr) => [...arr, ...particles]);
  }

  /**
   * Elimina las partículas expiradas en lote.
   */
  private cleanup() {
    const now = Date.now();
    // Solo actualizamos el signal si realmente hay algo que borrar
    // Para ello comprobamos si hay alguna partícula expirada antes de filtrar
    // Sin embargo, hacer find() y luego filter() podría ser redundante.
    // Dado que el update es costoso solo si cambia la referencia, podemos comprobar
    // si el length cambia.

    // Optimización: leer el valor actual
    const current = this._particles();
    if (current.length === 0) return;

    // Separar activas de expiradas
    const active: Particle[] = [];
    const expired: Particle[] = [];

    for (const p of current) {
      if (now - p.startTime < p.duration) {
        active.push(p);
      } else {
        expired.push(p);
      }
    }

    if (active.length !== current.length) {
      // Reciclar las expiradas
      this.deadPool.push(...expired);
      // Limitar tamaño del pool para no consumir memoria infinita si se dejan de usar
      if (this.deadPool.length > 200) {
        this.deadPool.length = 200;
      }
      this._particles.set(active);
    }
  }

  /**
   * Elimina todas las partículas activas inmediatamente.
   */
  clear() {
    this._particles.set([]);
  }
}
