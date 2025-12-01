import { PlayerStats } from '@services/player-stats.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, signal } from '@angular/core';
import { PointsService } from '@services/points.service';
import { SkinsService } from '@services/skins.service';
import { AchievementsService } from '@services/achievements.service';
import { ParticlesService } from '@services/particles.service';
import { AudioService } from '@services/audio.service';
import { Subscription } from 'rxjs';
import Decimal from 'break_infinity.js';
import { SKINS } from '@data/skin.data';

/**
 * Componente principal del juego que gestiona la croqueta clickeable.
 * Maneja los clics del usuario (incluido multitouch), animaciones,
 * generación de partículas y desbloqueo de logros relacionados con clicks.
 */
@Component({
  selector: 'app-clicker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clicker.html',
  styleUrl: './clicker.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Clicker implements OnInit, OnDestroy {
  /** Lista de todas las skins disponibles */
  skins = SKINS;

  /** Skin actualmente visible */
  currentSkin = signal<number>(1);

  /** Skin anterior (para animaciones de cambio) */
  previousSkin = signal<number>(1);

  /** Indica si se debe mostrar la skin anterior durante la transición */
  showPrevious = signal(false);

  /** Indica si el jugador está AFK (inactivo) */
  isAfk = signal(false);

  /** Timer para detectar inactividad */
  private afkTimeout?: any;

  /** Tiempo de inactividad antes de marcar como AFK (5 segundos) */
  private readonly afkDelay = 5000;

  /** Timestamps de los clicks recientes para detección de spam (ventana de 10s) */
  private clickTimestamps: number[] = [];

  /** Ventana de tiempo para contar clicks rápidos (10 segundos) */
  private readonly clickWindowMs = 10_000;

  /** Timer para detectar 1 hora sin clicks (para logro especial) */
  private noClicksTimeout?: any;

  /** Tiempo sin clicks para desbloquear el logro (1 hora) */
  private readonly noClicksDelayMs = 60 * 60 * 1000;

  /** Suscripción a cambios de skin */
  private skinSub?: Subscription;

  constructor(
    public pointsService: PointsService,
    private skinsService: SkinsService,
    public playerStats: PlayerStats,
    private achievementsService: AchievementsService,
    private particlesService: ParticlesService,
    private audioService: AudioService
  ) {
    this.skinSub = this.skinsService.skinChanged$.subscribe((id) => {
      if (id !== this.currentSkin()) this.currentSkin.set(id);
    });
  }

  /**
   * Obtiene la URL de la imagen de una skin por su ID.
   * @param skinId ID de la skin
   * @returns URL de la imagen o string vacío si no se encuentra
   */
  getSkinImage = (skinId: number) => this.skins.find((s) => s.id === skinId)?.image || '';

  /**
   * Maneja el evento de clic en la croqueta.
   * @param event Evento del mouse (opcional para clics generados por código)
   */
  onClick(event?: MouseEvent) {
    this.audioService.resumeIfNeeded();
    // obtener las coordenadas relativas al contenedor principal (clicker-container)
    let x: number | undefined,
      y: number | undefined,
      containerWidth = 500;
    if (event) {
      const rect = (event.currentTarget as HTMLElement)
        .closest('.clicker-container')
        ?.getBoundingClientRect();
      if (rect) {
        x = event.clientX - rect.left;
        y = event.clientY - rect.top;
        containerWidth = rect.width;
      }
    }

    this.processClick(x, y, containerWidth);
  }

  /**
   * Maneja eventos de toque (multitouch) para dispositivos táctiles.
   * Procesa múltiples toques simultáneos.
   * @param event Evento de toque
   */
  onTouchStart(event: TouchEvent) {
    this.audioService.resumeIfNeeded();
    event.preventDefault(); // prevenir el click emulado

    const rect = (event.currentTarget as HTMLElement)
      .closest('.clicker-container')
      ?.getBoundingClientRect();

    if (!rect) return;

    const containerWidth = rect.width;

    // procesar cada toque simultaneo
    Array.from(event.changedTouches).forEach((touch) => {
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      this.processClick(x, y, containerWidth);
    });
  }

  /**
   * Procesa la lógica de un clic: añadir puntos, generar partículas,
   * reproducir sonido y comprobar logros.
   * @param x Posición X del clic (opcional)
   * @param y Posición Y del clic (opcional)
   * @param containerWidth Ancho del contenedor para calcular posiciones
   */
  private processClick(x?: number, y?: number, containerWidth = 500) {
    this.pointsService.addPointsPerClick(x, y);
    this.playerStats.addClick();
    this.playerStats.checkLevelUp();
    this.recordClickTimestampAndCheck(); // cuenta clicks en los últimos 10s y desbloquea si toca
    this.resetNoClicksTimer(); // cada click cancela / reinicia el timer de 1h
    this.resetAfkTimer();
    this.checkAchievements(); // tus achievements por puntos siguen ahí

    // generar partículas en la posición del click
    if (x !== undefined && y !== undefined) this.particlesService.spawn(x, y, 6);

    const skin = this.skins.find((s) => s.id === this.skinsService.skinId());
    // generar partículas de croquetas cayendo con personalización según skin
    this.particlesService.spawnFallingCroquetas(
      containerWidth,
      3,
      skin?.particleImage || '/assets/skins/croqueta-normal.webp'
    );

    const crunch = [1, 2, 3].map((n) => `/assets/sfx/crunch${n}.mp3`);
    this.audioService.playSfx(crunch[Math.floor(Math.random() * 3)], 1);
  }

  // Logros
  private readonly achievements = [
    ['primera_croqueta', '1'],
    ['1k_croquetas', '1e3'],
    ['1m_croquetas', '1e6'],
    ['1b_croquetas', '1e9'],
    ['1t_croquetas', '1e12'],
    ['1qa_croquetas', '1e15'],
    ['1qi_croquetas', '1e18'],
    ['1sx_croquetas', '1e21'],
    ['1sp_croquetas', '1e24'],
    ['1oc_croquetas', '1e27'],
    ['1nn_croquetas', '1e30'],
    ['1dc_croquetas', '1e33'],
  ];

  /**
   * Comprueba y desbloquea logros basados en la cantidad total de croquetas.
   */
  checkAchievements() {
    // pointsService.points() devuelve un Decimal (signal)
    const current = this.pointsService.points();
    this.achievements.forEach(([id, threshold]) => {
      if (current.gte(new Decimal(threshold))) {
        this.achievementsService.unlockAchievement(id);
      }
    });
  }

  ngOnInit() {
    this.startAfkTimer();

    // iniciar timer para el logro "no_clics_1h"
    this.startNoClicksTimer();
  }

  /**
   * Previene la activación del botón con teclado (Enter/Espacio).
   * @param event Evento de teclado
   */
  preventKey(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  /**
   * Inicia el temporizador para detectar inactividad (AFK).
   */
  startAfkTimer() {
    this.afkTimeout = setTimeout(() => {
      this.isAfk.set(true);
    }, this.afkDelay);
  }

  /**
   * Reinicia el temporizador de AFK al detectar actividad.
   */
  resetAfkTimer() {
    clearTimeout(this.afkTimeout);
    this.isAfk.set(false);
    this.startAfkTimer();
  }

  /**
   * Registra un timestamp de clic y comprueba si se deben desbloquear
   * logros por clicks rápidos (70, 100, 250 clicks en 10 segundos).
   */
  private recordClickTimestampAndCheck() {
    const now = Date.now();
    // insertar timestamp y filtrar los antiguos fuera de la ventana
    this.clickTimestamps.push(now);
    this.clickTimestamps = this.clickTimestamps.filter((t) => t >= now - this.clickWindowMs);

    const count = this.clickTimestamps.length;
    // desbloqueamos en orden descendente, así si llegas a 250 también se intentan desbloquear 120 y 70
    if (count >= 250) {
      ['autoclicker', 'speedrun', 'click_rapido'].forEach((id) =>
        this.achievementsService.unlockAchievement(id)
      );
    } else if (count >= 100) {
      ['speedrun', 'click_rapido'].forEach((id) => this.achievementsService.unlockAchievement(id));
    } else if (count >= 70) {
      this.achievementsService.unlockAchievement('click_rapido');
    }
  }

  /**
   * Inicia el temporizador de 1 hora sin clicks para el logro especial.
   */
  private startNoClicksTimer() {
    // limpia cualquier timer existente
    clearTimeout(this.noClicksTimeout);
    // arrancar timer: si pasa 1 hora sin clicks, se desbloquea
    this.noClicksTimeout = setTimeout(
      () => this.achievementsService.unlockAchievement('no_clicks_1h'),
      this.noClicksDelayMs
    );
  }

  /**
   * Reinicia el temporizador de "sin clicks" al detectar un clic.
   */
  private resetNoClicksTimer() {
    // llamado en cada click: cancela el timer y lo vuelve a arrancar
    clearTimeout(this.noClicksTimeout);
    this.startNoClicksTimer();
  }

  ngOnDestroy() {
    this.skinSub?.unsubscribe();
    clearTimeout(this.afkTimeout);
    clearTimeout(this.noClicksTimeout);
  }
}
