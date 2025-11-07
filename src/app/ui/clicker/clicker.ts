import { PlayerStats } from '@services/player-stats.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { PointsService } from '@services/points.service';
import { SkinsService } from '@services/skins.service';
import { Subscription } from 'rxjs';
import { AchievementsService } from '@services/achievements.service';
import { ParticlesService } from '@services/particles.service';
import { AudioService } from '@services/audio.service';
import Decimal from 'break_infinity.js';

@Component({
  selector: 'app-clicker',
  imports: [CommonModule],
  templateUrl: './clicker.html',
  styleUrl: './clicker.css',
})
export class Clicker implements OnInit, OnDestroy {
  croquetaClass = '';
  private skinSub?: Subscription;
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
  ) {}

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
    // guardar puntos tras cada click
    this.pointsService.saveToStorage();
    this.playerStats.saveToStorage();

    this.recordClickTimestampAndCheck(); // cuenta clicks en los últimos 10s y desbloquea si toca
    this.resetNoClicksTimer(); // cada click cancela / reinicia el timer de 1h

    this.resetAfkTimer();
    this.checkAchievements(); // tus achievements por puntos siguen ahí

    // generar partículas en la posición del click
    if (x !== undefined && y !== undefined) {
      this.particlesService.spawn(x, y, 8);
    }

    // generar partículas de croquetas cayendo
    this.particlesService.spawnFallingCroquetas(containerWidth, 5);

    // SFX
    this.audioService.playSfx("/assets/sfx/click01.mp3",1)
  }

  // Logros (thresholds como Decimal)
  achievements: { id: string; threshold: Decimal }[] = [
    { id: 'primera_croqueta', threshold: new Decimal('1') },
    { id: '100_croquetas', threshold: new Decimal('1e2') },
    { id: '1k_croquetas', threshold: new Decimal('1e3') },
    { id: '10k_croquetas', threshold: new Decimal('1e4') },
    { id: '100k_croquetas', threshold: new Decimal('1e5') },
    { id: '1m_croquetas', threshold: new Decimal('1e6') },
    { id: '100m_croquetas', threshold: new Decimal('1e8') },
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
    // suscribirse a los cambios del skin
    this.skinSub = this.skinsService.skinChanged$.subscribe((id) => {
      this.updateCroquetaStyle(id);
    });

    // inicializar con el valor actual
    this.updateCroquetaStyle(this.skinsService.skinId());
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

  updateCroquetaStyle(id: number) {
    switch (id) {
      case 1:
        this.croquetaClass = 'croqueta-normal';
        break;
      case 2:
        this.croquetaClass = 'croqueta-jamon';
        break;
      case 3:
        this.croquetaClass = 'croqueta-pollo';
        break;
      case 4:
        this.croquetaClass = 'croqueta-queso';
        break;
      case 5:
        this.croquetaClass = 'croqueta-bacalao';
        break;
      case 6:
        this.croquetaClass = 'croqueta-setas';
        break;
      case 7:
        this.croquetaClass = 'croqueta-dorada';
        break;
      case 8:
        this.croquetaClass = 'croqueta-quemada';
        break;
      case 9:
        this.croquetaClass = 'croqueta-cosmica';
        break;
      case 10:
        this.croquetaClass = 'croqueta-rey';
        break;
      case 11:
        this.croquetaClass = 'croqueta-papa';
        break;
      case 12:
        this.croquetaClass = 'croqueta-dios';
        break;
      case 13:
        this.croquetaClass = 'croqueta-phillipe';
        break;
      case 14:
        this.croquetaClass = 'croqueta-cookie';
        break;
      case 15:
        this.croquetaClass = 'croqueta-platano';
        break;
      case 16:
        this.croquetaClass = 'croqueta-real';
        break;
      default:
        this.croquetaClass = 'croqueta-normal';
        break;
    }
  }

  startAfkTimer() {
    this.afkTimeout = setTimeout(() => {
      this.croquetaClass += ' afk';
    }, this.afkDelay);
  }

  resetAfkTimer() {
    clearTimeout(this.afkTimeout);
    this.croquetaClass = this.croquetaClass.replace(' afk', '');
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
    this.skinSub?.unsubscribe(); // limpiar la suscripción
    clearTimeout(this.afkTimeout);
    clearTimeout(this.noClicksTimeout);
  }
}
