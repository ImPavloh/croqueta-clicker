import { AchievementsService } from '@services/achievements.service';
import {
  Component,
  signal,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  inject,
  HostListener,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Navbar } from '@ui/navbar/navbar';
import { Clicker } from '@ui/clicker/clicker';
import { Counter } from '@ui/counter/counter';
import { Particles } from '@ui/particles/particles';
import { Floating } from '@ui/floating/floating';
import { Croquetita } from '@ui/croquetita/croquetita';
import { PointsService } from '@services/points.service';
import { PlayerStats } from '@services/player-stats.service';
import { AchievementPopup } from '@ui/achievement-popup/achievement-popup';
import { LevelUpPopup } from '@ui/level-up-popup/level-up-popup';
import { NewsLine } from '@ui/newsline/newsline';
import { Modal } from '@ui/modal/modal';
import { FloatingButtons } from '@ui/floating-buttons/floating-buttons';
import { Subscription } from 'rxjs';
import { AudioService } from '@services/audio.service';
import { AutosaveService } from '@services/autosave.service';
import { GoldenCroquetaService } from '@services/golden-croqueta.service';
import { GoldenCroqueta } from '@ui/golden-croqueta/golden-croqueta';
import { Splash } from '@ui/splash/splash';
import { StatsComponent } from '@ui/stats/stats';
import { SkinUnlockPopup } from '@ui/skin-unlock-popup/skin-unlock-popup';
import { Backgrounds } from '@ui/backgrounds/backgrounds';
import { SkinsService } from '@services/skins.service';
import { ModalService } from '@services/modal.service';
import { DebugService } from '@services/debug.service';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { SupabaseService } from '@services/supabase.service';
import { SwUpdate } from '@angular/service-worker';
import { Leaderboard } from '@ui/leaderboard/leaderboard';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    Navbar,
    Clicker,
    Counter,
    AchievementPopup,
    LevelUpPopup,
    Particles,
    Floating,
    Croquetita,
    NewsLine,
    Modal,
    FloatingButtons,
    GoldenCroqueta,
    TranslocoModule,
    Splash,
    StatsComponent,
    SkinUnlockPopup,
    Backgrounds,
    Leaderboard,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('croqueta-clicker');
  isDebugMode = false;

  constructor(
    private points: PointsService,
    private playerStats: PlayerStats,
    private audioService: AudioService,
    private autosaveService: AutosaveService,
    private achievementsService: AchievementsService,
    private goldenCroquetaService: GoldenCroquetaService,
    private skinsService: SkinsService,
    private modalService: ModalService,
    private debugService: DebugService,
    private translocoService: TranslocoService,
    private supabase: SupabaseService,
    private swUpdate: SwUpdate
  ) {
    this.debugService.isDebugMode$.subscribe((is) => (this.isDebugMode = is));
  }

  private level: number = 1;
  private levelSub?: Subscription;

  public isMobile: boolean = window.innerWidth <= 1344;

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey && event.shiftKey && event.key === 'F12') {
      this.openDebugMenu();
    }
  }

  openDebugMenu() {
    if (!this.debugService.isDebugMode) {
      this.modalService.showConfirm({
        title: this.translocoService.translate('debug.confirm.title'),
        message: this.translocoService.translate('debug.confirm.message'),
        confirmText: this.translocoService.translate('debug.confirm.confirm'),
        cancelText: this.translocoService.translate('debug.confirm.cancel'),
        onConfirm: () => {
          this.debugService.enableDebugMode();
          this.modalService.openModal('debug');
        },
      });
    } else {
      this.modalService.openModal('debug');
    }
  }

  ngOnInit(): void {}

  ngOnDestroy() {
    this.levelSub?.unsubscribe();
    this.playerStats.stopTimer();
  }

  protected onSplashComplete(): void {
    this.playerStats.startTimer();

    // Asegurar que exista una sesion anónima de supabase para interacciones con la leadboard
    // Intencionalmente mantenemos el juego local
    // la autenticación solo se usa para las entradas de la leadboard
    this.supabase.getUser().then(async (r) => {
      if (!r?.data?.user) {
        await this.supabase.signInAnonymously().catch(() => {
          // ignorar errores (el leaderboard lo maneja, o deberia)
        });
      }

      setTimeout(() => {
        this.modalService.shouldCheckUsername.set(true);
      }, 100);
    });

    // procesar pendientes cuando vuelva a estar online
    window.addEventListener('online', async () => {
      try {
        const result = await this.supabase.processPendingScores();
        if (result && result.processed > 0) {
        }
      } catch (e) {
        console.warn('Error:', e);
      }
      // Al recuperar conexión, también comprobamos actualizaciones (forzadas)
      this.maybeCheckForUpdate(true);
    });

    // si el usuario ya esta online al cargar la app entonces procesar pendientes
    if (navigator.onLine) {
      this.supabase.processPendingScores().catch(() => {});
    }

    // Inicializamos el chequeo diario de actualizaciones (si el SW está habilitado)
    this.setupDailyUpdateCheck();

    this.levelSub = this.playerStats.level$.subscribe((level) => {
      let url = '/assets/ost/bechamel.mp3';
      if (level > 100) {
        url = '/assets/ost/phillipethepope.mp3';
        this.achievementsService.unlockAchievement('achievement_ost');
      } else if (level > 5) {
        url = '/assets/ost/croquetauniversity.mp3';
      }

      this.audioService.playMusic(url, true, 2);
    });
    this.goldenCroquetaService.startSpawnCheck();
  }

  // hago todo esto aquí por el cache del service worker que si no no funciona del todo bien, no siempre se actualiza
  private readonly UPDATE_CHECK_KEY = 'lastUpdateCheck';
  private readonly UPDATE_INTERVAL_MS = 1000 * 60 * 60 * 24; // 24 horas

  private setupDailyUpdateCheck() {
    if (!this.swUpdate?.isEnabled) return;

    // cuando hay una nueva versión disponible preguntamos al usuario
    this.swUpdate.versionUpdates.subscribe((evt) => {
      if (evt?.type !== 'VERSION_READY') return;
      try {
        this.modalService.showConfirm({
          title:
            this.translocoService.translate('update.available.title') || 'Actualización disponible',
          message:
            this.translocoService.translate('update.available.message') ||
            'Hay una nueva versión de la aplicación disponible. ¿Recargar ahora para aplicar la actualización?',
          confirmText: this.translocoService.translate('update.available.confirm') || 'Recargar',
          cancelText: this.translocoService.translate('update.available.cancel') || 'Más tarde',
          onConfirm: async () => {
            try {
              await this.swUpdate.activateUpdate();
            } finally {
              location.reload();
            }
          },
        });
      } catch (e) {
        // fallback, se intenta aplicar de forma silenciosa
        this.swUpdate
          .activateUpdate()
          .then(() => location.reload())
          .catch(() => {});
      }
    });

    // chequeo inicial si procede
    this.maybeCheckForUpdate(false);
  }

  private async maybeCheckForUpdate(force = false) {
    if (!this.swUpdate?.isEnabled) return;
    if (!navigator.onLine) return;

    try {
      const last = Number(localStorage.getItem(this.UPDATE_CHECK_KEY) || 0);
      const now = Date.now();

      if (force || now - last > this.UPDATE_INTERVAL_MS) {
        localStorage.setItem(this.UPDATE_CHECK_KEY, String(now));
        await this.swUpdate.checkForUpdate();
      }
    } catch (e) {
      console.warn('Update check failed', e);
    }
  }
}
