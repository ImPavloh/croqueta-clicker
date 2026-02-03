import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  inject,
  NgZone,
  output,
} from '@angular/core';
import { PixiEngineService } from '@services/pixi-engine.service';
import { SkinsService } from '@services/skins.service';
import { SKINS } from '@data/skin.data';

/**
 * Componente contenedor para el motor PixiJS
 *
 * Renderiza todo el contenido del juego en un único canvas WebGL:
 * - Light rays decorativos
 * - Croqueta con animaciones
 * - Sistema de partículas
 * - Textos flotantes
 * - TODO: elementos y animaciones mejores
 */
@Component({
  selector: 'app-pixi-canvas',
  template: `<div #pixiContainer class="pixi-container"></div>`,
  styles: [
    `
      :host {
        display: contents;
      }

      .pixi-container {
        position: absolute;
        inset: 0;
        pointer-events: auto;
        z-index: 10;
        touch-action: manipulation;
        cursor: pointer;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PixiCanvasComponent implements AfterViewInit, OnDestroy {
  @ViewChild('pixiContainer', { static: true })
  containerRef!: ElementRef<HTMLDivElement>;

  engineReady = output<void>();

  private pixiEngine = inject(PixiEngineService);
  private skinsService = inject(SkinsService);
  private ngZone = inject(NgZone);
  private resizeObserver?: ResizeObserver;

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.initializePixi();
        });
      });
    });
  }

  private async initializePixi(): Promise<void> {
    const container = this.containerRef?.nativeElement;
    if (!container) return;

    try {
      await this.pixiEngine.initialize(container);

      const skinId = this.skinsService.skinId();
      const skin = SKINS.find((s) => s.id === skinId);
      const textureUrl = skin?.image || '/assets/skins/croqueta-normal.webp';

      await this.pixiEngine.setCroquetaTexture(textureUrl);
      this.pixiEngine.setCroquetaSize(this.getCroquetaSize());

      await this.pixiEngine.setupLights();

      this.resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) {
            this.pixiEngine.resize(width, height);
            this.pixiEngine.setCroquetaSize(this.getCroquetaSize());
          }
        }
      });
      this.resizeObserver.observe(container);

      this.skinsService.skinChanged$.subscribe(async (id) => {
        const newSkin = SKINS.find((s) => s.id === id);
        if (newSkin) {
          await this.pixiEngine.setCroquetaTexture(newSkin.image);
        }
      });

      this.ngZone.run(() => {
        this.engineReady.emit();
      });
    } catch (e) {
      console.error('PixiCanvas: Error inicializando', e);
    }
  }

  private getCroquetaSize(): number {
    const vw = window.innerWidth;
    const baseWidth = Math.min(187, vw * 0.3);
    const maxWidth = 250;
    return Math.min(baseWidth, maxWidth);
  }

  async updateCroquetaTexture(url: string): Promise<void> {
    await this.pixiEngine.setCroquetaTexture(url);
  }

  updateCroquetaSize(size: number): void {
    this.pixiEngine.setCroquetaSize(size);
  }

  setAfk(afk: boolean): void {
    this.pixiEngine.setAfk(afk);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }
}
