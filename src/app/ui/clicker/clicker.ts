import { PlayerStats } from '@services/player-stats.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, signal } from '@angular/core';
import { PointsService } from '@services/points.service';
import { SkinsService } from '@services/skins.service';
import { AchievementsService } from '@services/achievements.service';
import { ParticlesService } from '@services/particles.service';
import { AudioService } from '@services/audio.service';
import Decimal from 'break_infinity.js';

@Component({
  selector: 'app-clicker',
  imports: [CommonModule],
  templateUrl: './clicker.html',
  styleUrl: './clicker.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Clicker implements OnInit, OnDestroy {
  currentSkin = signal<string>('croqueta-normal');
  previousSkin = signal<string>('croqueta-normal');
  showPrevious = signal(false);

  isAfk = signal(false);

  private afkTimeout?: any;
  private readonly afkDelay = 5000;

  // timestamps (ms) de los clicks recientes; ventana móvil de 10s
  private clickTimestamps: number[] = [];
  private readonly clickWindowMs = 10_000;

  // timer para detectar 1 hora sin clicks
  private noClicksTimeout?: any;
  private readonly noClicksDelayMs = 60 * 60 * 1000; // 1 hora

  constructor(
    public pointsService: PointsService,
    private skinsService: SkinsService,
    public playerStats: PlayerStats,
    private achievementsService: AchievementsService,
    private particlesService: ParticlesService,
    private audioService: AudioService
  ) {
    this.skinsService.skinChanged$.subscribe((id) => {
      const newSkin = this.getSkinClass(id);
      if (newSkin !== this.currentSkin()) {
        this.previousSkin.set(this.currentSkin());
        this.showPrevious.set(true);
        this.currentSkin.set(newSkin);

        setTimeout(() => {
          this.showPrevious.set(false);
        }, 600);
      }
    });
  }

  onClick(event?: MouseEvent) {
    // ME CAGO EN LA OST DE CRISTO PORQUE NO SE REPRODUCE JODEEEEEEEEEEEEEEEEEEEEEEEEEEEER
    this.audioService.resumeIfNeeded();
    // obtener las coordenadas relativas al contenedor principal (clicker-container)
    let x: number | undefined;
    let y: number | undefined;
    let containerWidth = 500;

    if (event) {
      const target = event.currentTarget as HTMLElement;
      const clickerContainer = target.closest('.clicker-container');

      if (clickerContainer) {
        const rect = clickerContainer.getBoundingClientRect();
        x = event.clientX - rect.left;
        y = event.clientY - rect.top;
        containerWidth = rect.width;
      }
    }

    this.pointsService.addPointsPerClick(x, y);
    this.playerStats.addClick();
    this.playerStats.checkLevelUp();
    // guardar con debounce
    this.pointsService.debouncedSave();
    this.playerStats.saveToStorage();

    this.recordClickTimestampAndCheck(); // cuenta clicks en los últimos 10s y desbloquea si toca
    this.resetNoClicksTimer(); // cada click cancela / reinicia el timer de 1h

    this.resetAfkTimer();
    this.checkAchievements(); // tus achievements por puntos siguen ahí

    // generar partículas en la posición del click
    if (x !== undefined && y !== undefined) {
      this.particlesService.spawn(x, y, 6);
    }

    // generar partículas de croquetas cayendo
    this.particlesService.spawnFallingCroquetas(containerWidth, 3);

    // SFX
    this.audioService.playSfx('/assets/sfx/click01.mp3', 1);
  }

  // Logros (thresholds como Decimal)
  achievements: { id: string; threshold: Decimal }[] = [
    { id: 'primera_croqueta', threshold: new Decimal('1') },
    { id: '1k_croquetas', threshold: new Decimal('1e3') },
    { id: '1m_croquetas', threshold: new Decimal('1e6') },
    { id: '1b_croquetas', threshold: new Decimal('1e9') },
    { id: '1t_croquetas', threshold: new Decimal('1e12') },
    { id: '1qa_croquetas', threshold: new Decimal('1e15') },
    { id: '1qi_croquetas', threshold: new Decimal('1e18') },
    { id: '1sx_croquetas', threshold: new Decimal('1e21') },
    { id: '1sp_croquetas', threshold: new Decimal('1e24') },
    { id: '1oc_croquetas', threshold: new Decimal('1e27') },
    { id: '1nn_croquetas', threshold: new Decimal('1e30') },
    { id: '1dc_croquetas', threshold: new Decimal('1e33') },
  ];

  checkAchievements() {
    // pointsService.points() devuelve un Decimal (signal)
    const current = this.pointsService.points();
    for (const a of this.achievements) {
      // usar gte() en lugar de operador numérico
      if (current.gte(a.threshold)) {
        this.achievementsService.unlockAchievement(a.id);
      }
    }
  }

  ngOnInit() {
    this.startAfkTimer();

    // iniciar timer para el logro "no_clics_1h"
    this.startNoClicksTimer();
  }

  preventKey(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  // esto lleva ya demasiado tiempo aqui asi, seria mejor hacer algo que gestione las skins mejor y no tan hardcodeado (usar data al menos)
  private getSkinClass(id: number): string {
    switch (id) {
      case 1:
        return 'croqueta-normal';
      case 2:
        return 'croqueta-jamon';
      case 3:
        return 'croqueta-pollo';
      case 4:
        return 'croqueta-queso';
      case 5:
        return 'croqueta-bacalao';
      case 6:
        return 'croqueta-setas';
      case 7:
        return 'croqueta-dorada';
      case 8:
        return 'croqueta-quemada';
      case 9:
        return 'croqueta-cosmica';
      case 10:
        return 'croqueta-rey';
      case 11:
        return 'croqueta-papa';
      case 12:
        return 'croqueta-dios';
      case 13:
        return 'croqueta-phillipe';
      case 14:
        return 'croqueta-cookie';
      case 15:
        return 'croqueta-platano';
      case 16:
        return 'croqueta-real';
      default:
        return 'croqueta-normal';
    }
  }

  startAfkTimer() {
    this.afkTimeout = setTimeout(() => {
      this.isAfk.set(true);
    }, this.afkDelay);
  }

  resetAfkTimer() {
    clearTimeout(this.afkTimeout);
    this.isAfk.set(false);
    this.startAfkTimer();
  }

  private recordClickTimestampAndCheck() {
    const now = Date.now();
    // insertar timestamp y filtrar los antiguos fuera de la ventana
    this.clickTimestamps.push(now);
    const cutoff = now - this.clickWindowMs;
    // mantener sólo los timestamps >= cutoff
    while (this.clickTimestamps.length && this.clickTimestamps[0] < cutoff) {
      this.clickTimestamps.shift();
    }

    this.checkClickSpeedAchievements();
  }

  private checkClickSpeedAchievements() {
    const count = this.clickTimestamps.length;

    // desbloqueamos en orden descendente, así si llegas a 250 también se intentan desbloquear 120 y 70
    if (count >= 250) {
      this.achievementsService.unlockAchievement('autoclicker');
      // también desbloqueos menores (por si no se habían desbloqueado)
      this.achievementsService.unlockAchievement('speedrun');
      this.achievementsService.unlockAchievement('click_rapido');
      return;
    }
    if (count >= 100) {
      this.achievementsService.unlockAchievement('speedrun');
      this.achievementsService.unlockAchievement('click_rapido');
      return;
    }
    if (count >= 70) {
      this.achievementsService.unlockAchievement('click_rapido');
      return;
    }
    // si no cumple ninguno, no hacemos nada
  }

  private startNoClicksTimer() {
    // limpia cualquier timer existente
    clearTimeout(this.noClicksTimeout);
    // arrancar timer: si pasa 1 hora sin clicks, se desbloquea
    this.noClicksTimeout = setTimeout(() => {
      this.achievementsService.unlockAchievement('no_clicks_1h');
      // una vez desbloqueado, no reiniciamos automáticamente; si quieres permitir desbloquear de nuevo
      // (no tiene sentido para la mayoría de juegos), podrías reiniciar el timer aquí.
    }, this.noClicksDelayMs);
  }

  private resetNoClicksTimer() {
    // llamado en cada click: cancela el timer y lo vuelve a arrancar
    clearTimeout(this.noClicksTimeout);
    this.startNoClicksTimer();
  }

  // ---------------------------------------------------------------------------------------

  ngOnDestroy() {
    clearTimeout(this.afkTimeout);
    clearTimeout(this.noClicksTimeout);
  }
}
