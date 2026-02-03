import { Injectable, signal, OnDestroy, inject, NgZone } from '@angular/core';
import {
  Application,
  Container,
  Sprite,
  Graphics,
  Text,
  TextStyle,
  Ticker,
  Assets,
  Texture,
} from 'pixi.js';
import { Subject } from 'rxjs';
import { PerformanceService } from './performance.service';

// TODO REPLICA EL CSS ORIGINAL
// TODO: mejorar y optimizar animaciones ahora que usamos ticker (antes era setTimeout) y canvas en lugar de DOM

/**
 * Evento de click en el canvas
 */
export interface CanvasClickEvent {
  x: number;
  y: number;
  touches: number;
}

/**
 * Partícula optimizada para PixiJS
 */
export interface PixiParticle {
  sprite: Graphics | Sprite;
  shadow?: Sprite;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  rotationSpeed: number;
  active: boolean;
}

/**
 * Texto flotante en PixiJS
 */
export interface PixiFloatingText {
  text: Text;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  active: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PixiEngineService implements OnDestroy {
  private ngZone = inject(NgZone);
  private performanceService = inject(PerformanceService);

  // Observable de clicks para que otros componentes se suscriban
  private clickSubject = new Subject<CanvasClickEvent>();
  readonly onClick$ = this.clickSubject.asObservable();

  // PixiJS Application
  private app: Application | null = null;
  private initialized = signal(false);

  // Containers para organizar la escena
  private backgroundContainer!: Container;
  private croquetaContainer!: Container;
  private particlesContainer!: Container;
  private fallingContainer!: Container;
  private floatingTextsContainer!: Container;
  private foregroundContainer!: Container;

  // Light rays sprite (decorative background)
  private lightsSprite: Sprite | null = null;
  private lightsRotation = 0;

  // Croqueta sprite
  private croquetaSprite: Sprite | null = null;
  private croquetaScale = 1;
  private croquetaTargetScale = 1;
  private croquetaBaseScale = 1;
  private isAfk = false;
  private afkTime = 0;

  // Squish animation state
  private isSquishing = false;
  private squishTime = 0;
  private readonly SQUISH_DURATION = 0.25;

  // Object pools - partículas simples (círculos de click)
  private readonly PARTICLE_POOL_SIZE = 30;
  private particlePool: PixiParticle[] = [];
  private activeParticleCount = 0;

  // Pool separado para croquetas cayendo (imágenes)
  private readonly FALLING_POOL_SIZE = 50;
  private fallingPool: PixiParticle[] = [];
  private activeFallingCount = 0;

  private readonly FLOATING_TEXT_POOL_SIZE = 10;
  private floatingTextPool: PixiFloatingText[] = [];
  private activeFloatingTextCount = 0;

  private readonly ENABLE_SHADOWS = false;

  // Texturas precargadas
  private textures: Map<string, Texture> = new Map();
  private defaultCroquetaUrl = '/assets/skins/croqueta-normal.webp';

  // Textura de partícula circular precargada
  private circleTexture: Texture | null = null;

  // Colores para partículas
  private readonly PARTICLE_COLORS = [0xffd700, 0xffa500, 0xff8c00, 0xffffe0, 0xfff8dc];

  private readonly boundUpdate = this.update.bind(this);

  constructor() {}

  /**
   * Inicializa el motor PixiJS
   */
  async initialize(container: HTMLElement): Promise<void> {
    if (this.app) return;

    await this.ngZone.runOutsideAngular(async () => {
      // crear app PixiJS
      this.app = new Application();

      await this.app.init({
        background: 0x000000,
        backgroundAlpha: 0,
        resizeTo: container,
        antialias: !this.performanceService.isLowEnd(),
        powerPreference: 'high-performance',
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        autoDensity: true,
      });

      container.appendChild(this.app.canvas);

      this.app.canvas.style.position = 'absolute';
      this.app.canvas.style.top = '0';
      this.app.canvas.style.left = '0';
      this.app.canvas.style.width = '100%';
      this.app.canvas.style.height = '100%';
      this.app.canvas.style.pointerEvents = 'auto';
      this.app.canvas.style.touchAction = 'manipulation';
      this.app.canvas.style.cursor = 'pointer';

      this.setupClickHandlers(this.app.canvas);

      this.backgroundContainer = new Container();
      this.croquetaContainer = new Container();
      this.fallingContainer = new Container();
      this.particlesContainer = new Container();
      this.floatingTextsContainer = new Container();
      this.foregroundContainer = new Container();

      this.app.stage.addChild(this.backgroundContainer);
      this.app.stage.addChild(this.croquetaContainer);
      this.app.stage.addChild(this.fallingContainer);
      this.app.stage.addChild(this.particlesContainer);
      this.app.stage.addChild(this.floatingTextsContainer);
      this.app.stage.addChild(this.foregroundContainer);

      this.initializeParticlePool();
      this.initializeFallingPool();
      this.initializeFloatingTextPool();

      await this.preloadTextures();

      this.app.ticker.add(this.boundUpdate);

      this.initialized.set(true);
    });
  }

  /**
   * Precarga texturas comunes
   */
  private async preloadTextures(): Promise<void> {
    try {
      const croquetaTexture = await Assets.load(this.defaultCroquetaUrl);
      this.textures.set('croqueta-normal', croquetaTexture);

      const lightsTexture = await Assets.load('/assets/effects/lightrays.webp');
      this.textures.set('lightrays', lightsTexture);

      this.circleTexture = this.createCircleTexture(32);

      this.updateParticlePoolTextures();
    } catch (e) {
      console.warn('PixiEngine: Error cargando texturas', e);
    }
  }

  /**
   * Configura event listeners para clicks/touch en el canvas
   */
  private setupClickHandlers(canvas: HTMLCanvasElement): void {
    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (this.isPointInCroqueta(x, y)) {
        this.clickSubject.next({ x, y, touches: 1 });
      }
    };

    const handleTouch = (e: TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const touches = e.changedTouches;
      const totalTouches = e.touches.length;

      for (let i = 0; i < touches.length; i++) {
        const touch = touches[i];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        if (this.isPointInCroqueta(x, y)) {
          this.clickSubject.next({ x, y, touches: totalTouches });
        }
      }
    };

    this.ngZone.runOutsideAngular(() => {
      canvas.addEventListener('click', handleClick);
      canvas.addEventListener('touchstart', handleTouch, { passive: false });
    });
  }

  /**
   * Verifica si un punto está dentro del área de la croqueta
   */
  private isPointInCroqueta(x: number, y: number): boolean {
    if (!this.croquetaSprite || !this.app) return false;

    const cx = this.croquetaSprite.x;
    const cy = this.croquetaSprite.y;
    const radius = (this.croquetaSprite.width / 2) * 1.8;

    const dx = x - cx;
    const dy = y - cy;
    return dx * dx + dy * dy <= radius * radius;
  }

  /**
   * Crea una textura circular usando canvas offscreen
   */
  private createCircleTexture(size: number): Texture {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Gradiente radial para efecto glow
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();

    return Texture.from(canvas);
  }

  /**
   * Inicializa el pool de partículas con Sprites (más eficiente que Graphics)
   */
  private initializeParticlePool(): void {
    const tempTexture = this.circleTexture || Texture.WHITE;

    for (let i = 0; i < this.PARTICLE_POOL_SIZE; i++) {
      const sprite = new Sprite(tempTexture);
      sprite.anchor.set(0.5);
      sprite.visible = false;
      this.particlesContainer.addChild(sprite);

      this.particlePool.push({
        sprite,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 1,
        rotationSpeed: 0,
        active: false,
      });
    }
  }

  /**
   * Inicializa el pool de partículas cayendo (imágenes de croquetas)
   */
  private initializeFallingPool(): void {
    const defaultTexture = this.textures.get('croqueta-normal') || Texture.WHITE;
    const addShadows = this.ENABLE_SHADOWS && !this.performanceService.isLowEnd();

    for (let i = 0; i < this.FALLING_POOL_SIZE; i++) {
      // Crear sprite de sombra primero (debajo) - solo si está habilitado
      let shadow: Sprite | undefined;
      if (addShadows) {
        shadow = new Sprite(defaultTexture);
        shadow.anchor.set(0.5);
        shadow.visible = false;
        shadow.tint = 0x000000;
        shadow.alpha = 0.3;
        this.fallingContainer.addChild(shadow);
      }

      // Sprite principal
      const sprite = new Sprite(defaultTexture);
      sprite.anchor.set(0.5);
      sprite.visible = false;
      this.fallingContainer.addChild(sprite);

      this.fallingPool.push({
        sprite,
        shadow,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 1,
        rotationSpeed: 0,
        active: false,
      });
    }
  }

  /**
   * Actualiza las texturas del pool de partículas después de cargar
   */
  private updateParticlePoolTextures(): void {
    if (!this.circleTexture) return;

    for (const particle of this.particlePool) {
      if (particle.sprite instanceof Sprite) {
        particle.sprite.texture = this.circleTexture;
      }
    }
  }

  /**
   * Inicializa el pool de textos flotantes
   */
  private initializeFloatingTextPool(): void {
    const style = new TextStyle({
      fontFamily: 'Fredoka, sans-serif',
      fontSize: 32,
      fontWeight: '700',
      fill: 0xfff3d8,
      dropShadow: {
        color: 'rgba(0, 0, 0, 0.7)',
        blur: 4,
        distance: 2,
        angle: Math.PI / 4,
      },
    });

    for (let i = 0; i < this.FLOATING_TEXT_POOL_SIZE; i++) {
      const text = new Text({ text: '', style });
      text.visible = false;
      text.anchor.set(0.5, 0.5);
      this.floatingTextsContainer.addChild(text);

      this.floatingTextPool.push({
        text,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 1,
        active: false,
      });
    }
  }

  /**
   * Carga o actualiza la textura de la croqueta
   */
  async setCroquetaTexture(url: string): Promise<void> {
    if (!this.app) return;

    try {
      let texture = this.textures.get(url);
      if (!texture) {
        const loaded = (await Assets.load(url)) as Texture;
        if (!loaded) return;
        texture = loaded;
        this.textures.set(url, texture);
      }

      if (this.croquetaSprite) {
        this.croquetaSprite.texture = texture;
      } else {
        this.croquetaSprite = new Sprite(texture);
        this.croquetaSprite.anchor.set(0.5, 0.5);
        this.croquetaContainer.addChild(this.croquetaSprite);
      }

      this.updateCroquetaPosition();
    } catch (e) {
      console.warn('PixiEngine: Error cargando textura de croqueta', e);
    }
  }

  /**
   * Configura los light rays de fondo (decorativos)
   */
  async setupLights(): Promise<void> {
    if (!this.app) return;

    const texture = this.textures.get('lightrays');
    if (!texture) return;

    if (!this.lightsSprite) {
      this.lightsSprite = new Sprite(texture);
      this.lightsSprite.anchor.set(0.5);
      this.lightsSprite.alpha = 0.6;
      this.backgroundContainer.addChild(this.lightsSprite);
    }

    this.updateLightsPosition();
  }

  /**
   * Actualiza posición y tamaño de lights
   */
  private updateLightsPosition(): void {
    if (!this.app || !this.lightsSprite) return;

    const width = this.app.screen.width;
    const height = this.app.screen.height;
    const size = Math.min(width * 0.8, height * 0.8, 700);

    this.lightsSprite.x = width / 2;
    this.lightsSprite.y = height / 2;
    this.lightsSprite.width = size;
    this.lightsSprite.height = size;
  }

  /**
   * Actualiza la posición de la croqueta al centro
   */
  private updateCroquetaPosition(): void {
    if (!this.app || !this.croquetaSprite) return;

    const width = this.app.screen.width;
    const height = this.app.screen.height;

    this.croquetaSprite.x = width / 2;
    this.croquetaSprite.y = height / 2;
  }

  /**
   * Configura el tamaño de la croqueta
   */
  setCroquetaSize(size: number): void {
    if (!this.croquetaSprite) return;
    const scale = size / this.croquetaSprite.texture.width;
    this.croquetaTargetScale = scale;
    this.croquetaBaseScale = scale;
  }

  /**
   * Activa/desactiva modo AFK (animación de balanceo)
   */
  setAfk(afk: boolean): void {
    this.isAfk = afk;
    if (afk) {
      this.afkTime = 0;
    }
  }

  /**
   * Anima el squish de la croqueta al hacer clic
   * Ahora usa animación basada en ticker para suavidad
   */
  squishCroqueta(): void {
    if (!this.croquetaSprite) return;

    // Reiniciar la animación de squish (permite clicks rápidos)
    this.isSquishing = true;
    this.squishTime = 0;
  }

  /**
   * Spawna partículas en una posición (usando Sprites con tint para rendimiento)
   */
  spawnParticles(x: number, y: number, count: number = 8): void {
    if (!this.app) return;

    const quality = this.performanceService.qualityFactor();
    const adjustedCount = Math.ceil(count * quality);
    const maxParticles = this.performanceService.getMaxParticles();

    for (let i = 0; i < adjustedCount && this.activeParticleCount < maxParticles; i++) {
      const particle = this.getInactiveParticle();
      if (!particle) break;

      const angle = (Math.PI * 2 * i) / adjustedCount + (Math.random() - 0.5) * 0.5;
      const speed = 100 + Math.random() * 150;
      const color = this.PARTICLE_COLORS[Math.floor(Math.random() * this.PARTICLE_COLORS.length)];
      const size = (6 + Math.random() * 6) / 16; // Escala relativa a textura de 32px

      // Configurar sprite con tint (mucho más eficiente que Graphics)
      const sprite = particle.sprite as Sprite;
      sprite.tint = color;
      sprite.scale.set(size);
      sprite.x = x;
      sprite.y = y;
      sprite.visible = true;
      sprite.alpha = 1;

      particle.vx = Math.cos(angle) * speed;
      particle.vy = Math.sin(angle) * speed - 100;
      particle.life = 1.0 + Math.random() * 0.5;
      particle.maxLife = particle.life;
      particle.rotationSpeed = (Math.random() - 0.5) * 5;
      particle.active = true;

      this.activeParticleCount++;
    }
  }

  /**
   * Spawna croquetas cayendo (usando imágenes reales de la skin)
   */
  async spawnFallingCroquetas(
    containerWidth: number,
    count: number,
    imageUrl: string,
  ): Promise<void> {
    if (!this.app) return;

    // Cargar textura si no existe
    let texture = this.textures.get(imageUrl);
    if (!texture) {
      try {
        texture = (await Assets.load(imageUrl)) as Texture;
        this.textures.set(imageUrl, texture);
      } catch {
        texture = this.textures.get('croqueta-normal') || Texture.WHITE;
      }
    }

    const quality = this.performanceService.qualityFactor();
    const adjustedCount = Math.ceil(count * quality);
    const screenWidth = this.app.screen.width;

    for (let i = 0; i < adjustedCount; i++) {
      const particle = this.getInactiveFallingParticle();
      if (!particle) break;

      const x = Math.random() * screenWidth;
      const y = -50;
      const baseSize = 15 + Math.random() * 10;
      const scale = baseSize / (texture?.width || 100);

      const sprite = particle.sprite as Sprite;
      sprite.texture = texture!;
      sprite.tint = 0xffffff;
      sprite.scale.set(scale);
      sprite.x = x;
      sprite.y = y;
      sprite.visible = true;
      sprite.alpha = 0.8;
      sprite.rotation = Math.random() * Math.PI * 2;

      // Configurar sombra si existe
      if (particle.shadow) {
        particle.shadow.texture = texture!;
        particle.shadow.scale.set(scale);
        particle.shadow.x = x + 3;
        particle.shadow.y = y + 4;
        particle.shadow.visible = true;
        particle.shadow.alpha = 0.25;
        particle.shadow.rotation = sprite.rotation;
      }

      particle.vx = (Math.random() - 0.5) * 40;
      particle.vy = 220 + Math.random() * 80;
      particle.life = 1.2 + Math.random() * 0.6;
      particle.maxLife = particle.life;
      particle.rotationSpeed = (Math.random() - 0.5) * 3;
      particle.active = true;

      this.activeFallingCount++;
    }
  }

  /**
   * Obtiene una partícula inactiva del pool de círculos
   */
  private getInactiveParticle(): PixiParticle | null {
    for (const particle of this.particlePool) {
      if (!particle.active) return particle;
    }
    return null;
  }

  /**
   * Obtiene una partícula cayendo inactiva del pool de imágenes
   */
  private getInactiveFallingParticle(): PixiParticle | null {
    for (const particle of this.fallingPool) {
      if (!particle.active) return particle;
    }
    return null;
  }

  /**
   * Spawna un texto flotante
   */
  spawnFloatingText(x: number, y: number, value: string, color: number = 0xfff3d8): void {
    if (!this.app) return;

    const floatingText = this.getInactiveFloatingText();
    if (!floatingText) return;

    floatingText.text.text = value;
    floatingText.text.style.fill = color;
    floatingText.text.x = x;
    floatingText.text.y = y;
    floatingText.text.visible = true;
    floatingText.text.alpha = 1;
    floatingText.text.scale.set(1);

    floatingText.vx = 0;
    floatingText.vy = -48 / 0.9; // 48px en 0.9s = ~53px/s constante
    floatingText.life = 0.9; // 900ms
    floatingText.maxLife = 0.9;
    floatingText.active = true;

    this.floatingTextsContainer.addChild(floatingText.text);
    this.activeFloatingTextCount++;
  }

  /**
   * Obtiene un texto flotante inactivo del pool
   */
  private getInactiveFloatingText(): PixiFloatingText | null {
    for (const ft of this.floatingTextPool) {
      if (!ft.active) return ft;
    }
    return null;
  }

  /**
   * Update loop principal (llamado por PixiJS Ticker)
   */
  private update(ticker: Ticker): void {
    const deltaTime = ticker.deltaMS * 0.001;

    this.updateParticles(deltaTime);
    this.updateFloatingTexts(deltaTime);
    this.updateCroqueta(deltaTime);
  }

  /**
   * Actualiza todas las partículas activas (círculos y cayendo)
   */
  private updateParticles(deltaTime: number): void {
    const gravity = 300;
    const screenHeight = this.app?.screen.height ?? 800;
    const particlePool = this.particlePool;
    const fallingPool = this.fallingPool;
    const dt = deltaTime;

    // Actualizar partículas de círculos (click effects)
    for (let i = 0, len = particlePool.length; i < len; i++) {
      const particle = particlePool[i];
      if (!particle.active) continue;

      const sprite = particle.sprite;
      const vx = particle.vx;
      const vy = particle.vy;

      // Física - mutación directa sin crear objetos
      sprite.x += vx * dt;
      sprite.y += vy * dt;
      particle.vy = vy + gravity * dt;
      sprite.rotation += particle.rotationSpeed * dt;

      // Vida
      const newLife = particle.life - dt;
      particle.life = newLife;
      const lifeRatio = newLife > 0 ? newLife / particle.maxLife : 0;
      sprite.alpha = lifeRatio;

      // Desactivar si murió
      if (newLife <= 0) {
        particle.active = false;
        sprite.visible = false;
        this.activeParticleCount--;
      }
    }

    // Actualizar partículas cayendo (imágenes de croquetas)
    for (let i = 0, len = fallingPool.length; i < len; i++) {
      const particle = fallingPool[i];
      if (!particle.active) continue;

      const sprite = particle.sprite;
      const shadow = particle.shadow;

      sprite.x += particle.vx * dt;
      sprite.y += particle.vy * dt;
      particle.vy += 50 * dt;
      sprite.rotation += particle.rotationSpeed * dt;

      if (shadow) {
        shadow.x = sprite.x + 3;
        shadow.y = sprite.y + 4;
        shadow.rotation = sprite.rotation;
      }

      const newLife = particle.life - dt;
      particle.life = newLife;
      const lifeRatio = newLife > 0 ? newLife / particle.maxLife : 0;

      if (lifeRatio < 0.4) {
        const alpha = (lifeRatio / 0.4) * 0.8;
        sprite.alpha = alpha;
        if (shadow) shadow.alpha = alpha * 0.3;
      } else {
        sprite.alpha = 0.8;
        if (shadow) shadow.alpha = 0.25;
      }

      // Desactivar si murió o salió de pantalla
      if (newLife <= 0 || sprite.y > screenHeight + 30) {
        particle.active = false;
        sprite.visible = false;
        if (shadow) shadow.visible = false;
        this.activeFallingCount--;
      }
    }
  }

  /**
   * Actualiza todos los textos flotantes activos
   * sube lineal, fade empieza al 70%
   */
  private updateFloatingTexts(deltaTime: number): void {
    const pool = this.floatingTextPool;
    const dt = deltaTime;

    for (let i = 0, len = pool.length; i < len; i++) {
      const ft = pool[i];
      if (!ft.active) continue;

      const text = ft.text;

      // Movimiento lineal (sin desaceleración)
      text.x += ft.vx * dt;
      text.y += ft.vy * dt;

      // Vida
      const newLife = ft.life - dt;
      ft.life = newLife;
      const progress = 1 - newLife / ft.maxLife; // 0 -> 1

      // Fade: 100% hasta 70%, luego fade a 0
      text.alpha = progress < 0.7 ? 1 : 1 - (progress - 0.7) / 0.3;

      // Desactivar si murió
      if (newLife <= 0) {
        ft.active = false;
        text.visible = false;
        this.activeFloatingTextCount--;
      }
    }
  }

  /**
   * Actualiza lights (rotación lenta 20s por vuelta)
   */
  private updateLights(deltaTime: number): void {
    if (!this.lightsSprite) return;

    // Rotar: 360° en 20s = 18°/s = 0.314 rad/s
    this.lightsRotation += ((Math.PI * 2) / 20) * deltaTime;
    this.lightsSprite.rotation = this.lightsRotation;
  }

  /**
   * Actualiza la animación de la croqueta
   */
  private updateCroqueta(deltaTime: number): void {
    // Actualizar lights primero
    this.updateLights(deltaTime);

    if (!this.croquetaSprite) return;

    // Animación AFK: tilt-afk keyframes
    if (this.isAfk && !this.isSquishing) {
      this.afkTime += deltaTime;
      const cycle = (this.afkTime % 4) / 4; // 4s cycle, 0-1

      let rotation = 0;
      let scaleMultiplier = 1;

      if (cycle < 0.25) {
        // 0% -> 25%: rotate(-5deg) scale(1) -> scale(1.1)
        const t = cycle / 0.25;
        rotation = -0.0873 * (1 - t); // -5deg in radians
        scaleMultiplier = 1 + 0.1 * t;
      } else if (cycle < 0.5) {
        // 25% -> 50%: scale(1.1) -> rotate(5deg) scale(0.9)
        const t = (cycle - 0.25) / 0.25;
        rotation = 0.0873 * t; // 0 to 5deg
        scaleMultiplier = 1.1 - 0.2 * t; // 1.1 to 0.9
      } else if (cycle < 0.75) {
        // 50% -> 75%: rotate(5deg) scale(0.9) -> scale(1.1)
        const t = (cycle - 0.5) / 0.25;
        rotation = 0.0873 * (1 - t); // 5deg to 0
        scaleMultiplier = 0.9 + 0.2 * t; // 0.9 to 1.1
      } else {
        // 75% -> 100%: scale(1.1) -> rotate(-5deg) scale(1)
        const t = (cycle - 0.75) / 0.25;
        rotation = -0.0873 * t; // 0 to -5deg
        scaleMultiplier = 1.1 - 0.1 * t; // 1.1 to 1
      }

      this.croquetaSprite.rotation = rotation;
      this.croquetaSprite.scale.set(this.croquetaBaseScale * scaleMultiplier);
      return;
    }

    // Reset rotation when not AFK
    if (Math.abs(this.croquetaSprite.rotation) > 0.001) {
      this.croquetaSprite.rotation *= 0.9;
    }

    // Animación de squish suave basada en ticker
    if (this.isSquishing) {
      this.squishTime += deltaTime;
      const progress = this.squishTime / this.SQUISH_DURATION;

      if (progress >= 1) {
        this.isSquishing = false;
        this.croquetaSprite.scale.set(this.croquetaBaseScale);
      } else {
        let scaleX: number, scaleY: number;

        if (progress < 0.4) {
          const t = progress / 0.4;
          const ease = t * t;
          scaleX = this.croquetaBaseScale * (1 - 0.12 * ease);
          scaleY = this.croquetaBaseScale * (1 + 0.12 * ease);
        } else if (progress < 0.7) {
          const t = (progress - 0.4) / 0.3;
          const ease = 1 - Math.pow(1 - t, 2);
          scaleX = this.croquetaBaseScale * (0.88 + 0.17 * ease);
          scaleY = this.croquetaBaseScale * (1.12 - 0.17 * ease);
        } else {
          const t = (progress - 0.7) / 0.3;
          const ease = 1 - Math.pow(1 - t, 2);
          scaleX = this.croquetaBaseScale * (1.05 - 0.05 * ease);
          scaleY = this.croquetaBaseScale * (0.95 + 0.05 * ease);
        }
        this.croquetaSprite.scale.set(scaleX, scaleY);
      }
      return;
    }

    // Interpolar hacia el scale objetivo
    const currentScale = this.croquetaSprite.scale.x;
    const diff = this.croquetaTargetScale - currentScale;
    if (Math.abs(diff) > 0.001) {
      const newScale = currentScale + diff * deltaTime * 10;
      this.croquetaSprite.scale.set(newScale);
    }
  }

  /**
   * Redimensiona el canvas
   */
  resize(width: number, height: number): void {
    if (!this.app) return;
    this.app.renderer.resize(width, height);
    this.updateCroquetaPosition();
    this.updateLightsPosition();
  }

  /**
   * Obtiene el canvas element para agregar event listeners
   */
  getCanvas(): HTMLCanvasElement | null {
    return this.app?.canvas || null;
  }

  /**
   * Obtiene el estado de inicialización
   */
  isInitialized(): boolean {
    return this.initialized();
  }

  /**
   * Obtiene estadísticas para debug
   */
  getStats(): { activeParticles: number; activeTexts: number; activeFalling: number; fps: number } {
    return {
      activeParticles: this.activeParticleCount,
      activeTexts: this.activeFloatingTextCount,
      activeFalling: this.activeFallingCount,
      fps: this.app?.ticker.FPS ?? 0,
    };
  }

  /**
   * Limpia recursos
   */
  destroy(): void {
    if (this.app) {
      this.app.destroy(true, { children: true, texture: true });
      this.app = null;
    }
    this.particlePool = [];
    this.fallingPool = [];
    this.floatingTextPool = [];
    this.textures.clear();
    this.initialized.set(false);
  }

  ngOnDestroy(): void {
    this.destroy();
  }
}
