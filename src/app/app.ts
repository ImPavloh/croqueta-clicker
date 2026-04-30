import { AchievementsService } from '@services/achievements.service';
import {
  Component,
  signal,
  computed,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  inject,
  NgZone,
  Renderer2,
  effect,
  EffectRef,
  Injector,
  runInInjectionContext,
} from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';

import { Navbar } from '@ui/navbar/navbar';
import { Clicker } from '@ui/clicker/clicker';
import { Counter } from '@ui/counter/counter';
import { PixiCanvasComponent } from '@ui/pixi-canvas/pixi-canvas.component';
import { Floating } from '@ui/floating/floating';
import { Croquetita } from '@ui/croquetita/croquetita';
import { TutorialOverlayComponent } from '@ui/tutorial-overlay/tutorial-overlay';
import { LanguageSelectionComponent } from '@ui/language-selection/language-selection';
import { OptionsService } from '@services/options.service';
import { PlayerStats } from '@services/player-stats.service';
import { AchievementPopup } from '@ui/achievement-popup/achievement-popup';
import { LevelUpPopup } from '@ui/level-up-popup/level-up-popup';
import { NewsLine } from '@ui/newsline/newsline';
import { Modal } from '@ui/modal/modal';
import { FloatingButtons } from '@ui/floating-buttons/floating-buttons';
import { Subscription } from 'rxjs';
import { AudioService } from '@services/audio.service';
import { Splash } from '@ui/splash/splash';
import { StatsComponent } from '@ui/stats/stats';
import { SkinUnlockPopup } from '@ui/skin-unlock-popup/skin-unlock-popup';
import { Backgrounds } from '@ui/backgrounds/backgrounds';
import { ModalService } from '@services/modal.service';
import { DebugService } from '@services/debug.service';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { SupabaseService } from '@services/supabase.service';
import { SwUpdate } from '@angular/service-worker';
import { Leaderboard } from '@ui/leaderboard/leaderboard';
import { DailyContractsPanel } from '@ui/daily-contracts-panel/daily-contracts-panel';
import { EventComponent } from '@ui/event/event';
import { EventService } from '@services/event.service';
import { TimeService } from '@services/time.service';
import { FpsCounterComponent } from '@ui/fps-counter/fps-counter';
import { PerformanceService } from '@services/performance.service';
import { HudPanelsService } from '@services/hud-panels.service';
import { filter } from 'rxjs/operators';
import { Tooltip } from '@ui/tooltip/tooltip';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    Navbar,
    Clicker,
    Counter,
    AchievementPopup,
    LevelUpPopup,
    PixiCanvasComponent,
    Floating,
    Croquetita,
    NewsLine,
    Modal,
    FloatingButtons,
    TranslocoModule,
    Splash,
    StatsComponent,
    SkinUnlockPopup,
    Backgrounds,
    Leaderboard,
    DailyContractsPanel,
    EventComponent,
    Tooltip,
    TutorialOverlayComponent,
    LanguageSelectionComponent,
    FpsCounterComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('croqueta-clicker');
  isDebugMode = false;
  tutorialVisible = signal(false);
  languageSelectionVisible = signal(false);
  tutorialCompleted = signal(false);
  splashVisible = signal(false);
  firstTimeUser = signal(false);
  currentRoute = signal('/');
  showMobileRoutePanel = computed(() => this.isMobile && this.currentRoute() !== '/');

  private perfEffect?: EffectRef;
  private injector = inject(Injector);
  private hudPanels = inject(HudPanelsService);
  private routerSub?: Subscription;

  constructor(
    private playerStats: PlayerStats,
    private audioService: AudioService,
    private achievementsService: AchievementsService,
    protected modalService: ModalService,
    private debugService: DebugService,
    private translocoService: TranslocoService,
    private supabase: SupabaseService,
    private swUpdate: SwUpdate,
    private eventService: EventService,
    private options: OptionsService,
    protected timeService: TimeService,
    private router: Router,
    private ngZone: NgZone,
    private renderer: Renderer2,
    private performanceService: PerformanceService,
  ) {
    this.debugService.isDebugMode$.subscribe((is) => (this.isDebugMode = is));
    this.currentRoute.set(this.normalizeRoute(this.router.url));

    const tutorialDone = this.options.getGameItem('tutorial_completed') === 'true';
    const splashShown = this.options.getGameItem('splash_shown') === 'true';

    // Cargar idioma guardado
    const savedLang = this.options.getGameItem('lang');
    if (savedLang) {
      this.translocoService.setActiveLang(savedLang);
    }

    this.tutorialCompleted.set(tutorialDone);

    // Usuario nuevo: mostrar tutorial primero
    // Usuario nuevo: mostrar seleccion de idioma primero, luego tutorial
    const languageSelected = this.options.getGameItem('language_selected') === 'true';

    if (!tutorialDone && !splashShown) {
      this.firstTimeUser.set(true);
      if (!languageSelected) {
        this.languageSelectionVisible.set(true);
      } else {
        this.tutorialVisible.set(true);
      }
    }
    // Usuario que ya vio el tutorial pero no el splash
    else if (tutorialDone && !splashShown) {
      this.splashVisible.set(true);
    }
    // Usuario que ya vio todo: iniciar directamente
    else if (tutorialDone && splashShown) {
      setTimeout(() => this.onSplashComplete(), 100);
    }
  }

  private levelSub?: Subscription;
  private updateCheckIntervalId?: number;
  private mobileTapCount = 0;
  private mobileTapTimer?: number;
  private mobileDebugTapCount = 0;
  private mobileDebugTapTimer?: number;

  public isMobile: boolean = window.innerWidth <= 1344;
  public resolutionChanged = signal(false);
  private initialIsMobile = this.isMobile;

  reloadPage() {
    window.location.reload();
  }

  openHelpCenter() {
    this.modalService.openModal('help');
  }

  openOptionsSurface() {
    if (this.isMobile) {
      this.modalService.openModal('options');
      return;
    }

    this.closeCurrentModal();
    void this.router.navigateByUrl('/options');
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

  private setupPerformanceHints(): void {
    if (typeof document === 'undefined') return;

    runInInjectionContext(this.injector, () => {
      this.perfEffect = effect(() => {
        const isLowEnd = this.performanceService.isLowEnd();
        const isVeryLowEnd = this.performanceService.isVeryLowEnd();
        const prefersReduced = this.performanceService.prefersReducedMotion();
        const quality = this.performanceService.qualityFactor();

        const body = document.body;
        body.classList.toggle('perf-low', isLowEnd && !isVeryLowEnd);
        body.classList.toggle('perf-very-low', isVeryLowEnd);
        body.classList.toggle('perf-reduced', prefersReduced);
        document.documentElement.style.setProperty('--perf-quality', String(quality));
      });
    });
  }

  ngOnInit(): void {
    this.setupPerformanceHints();

    this.handleMobileContractsRoute(this.currentRoute());

    this.routerSub = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        const normalizedRoute = this.normalizeRoute(event.urlAfterRedirects);
        this.currentRoute.set(normalizedRoute);
        this.handleMobileContractsRoute(normalizedRoute);
      });

    this.ngZone.runOutsideAngular(() => {
      this.renderer.listen(window, 'resize', () => {
        // Solo verificamos si ha cambiado el breakpoint, no cada pixel
        const newIsMobile = window.innerWidth <= 1344;
        if (newIsMobile !== this.initialIsMobile) {
          // Solo entrar en la zona si realmente cambió el layout
          this.ngZone.run(() => {
            this.resolutionChanged.set(true);
            this.initialIsMobile = newIsMobile;
          });
        } else {
          // Si no cambia el layout, no notificamos a Angular
          // Opción: this.resolutionChanged.set(false) requeriría entrar en la zona,
          // pero si ya es false, mejor no hacer nada.
        }
      });

      this.renderer.listen(window, 'keydown', (event: KeyboardEvent) => {
        const isHelpShortcut = event.key === 'F1';
        const isOptionsShortcut = event.key === 'F2';
        const isQuestionShortcut =
          event.key === '?' && !event.ctrlKey && !event.altKey && !event.metaKey;

        if (isHelpShortcut || (isQuestionShortcut && !this.isEditableTarget(event.target))) {
          event.preventDefault();
          this.ngZone.run(() => {
            this.openHelpCenter();
          });
          return;
        }

        if (isOptionsShortcut && !this.isEditableTarget(event.target)) {
          event.preventDefault();
          this.ngZone.run(() => {
            this.openOptionsSurface();
          });
          return;
        }

        if (
          event.key === 'Escape' &&
          (this.modalService.currentModal() || this.hudPanels.activePanel())
        ) {
          event.preventDefault();
          this.ngZone.run(() => {
            this.closeCurrentModal();
          });
          return;
        }

        // Ctrl+Shift+F12
        if (event.ctrlKey && event.shiftKey && event.key === 'F12') {
          event.preventDefault();
          this.ngZone.run(() => {
            this.openDebugMenu();
          });
        }
      });

      // todos los voluemens = 33% + toque repetido en esquina superior izquierda = toggle fps, derecha = debug
      this.renderer.listen(window, 'touchstart', (event: TouchEvent) => {
        if (!this.isMobile || event.touches.length === 0) return;

        const volumesOk =
          this.options.generalVolume() === 33 &&
          this.options.musicVolume() === 33 &&
          this.options.sfxVolume() === 33;

        if (!volumesOk) return;

        const touch = event.touches[0];
        const x = touch.clientX;
        const y = touch.clientY;
        const w = window.innerWidth;

        // fps
        if (x <= 80 && y <= 80) {
          this.mobileTapCount++;
          if (this.mobileTapCount === 1) {
            this.mobileTapTimer = window.setTimeout(() => {
              this.mobileTapCount = 0;
            }, 1500);
          }
          if (this.mobileTapCount >= 5) {
            if (this.mobileTapTimer) window.clearTimeout(this.mobileTapTimer);
            this.mobileTapCount = 0;
            const evt = new CustomEvent('cc:toggle-fps');
            window.dispatchEvent(evt);
          }
          return;
        }

        // debug
        if (x >= w - 80 && y <= 80) {
          this.mobileDebugTapCount++;
          if (this.mobileDebugTapCount === 1) {
            this.mobileDebugTapTimer = window.setTimeout(() => {
              this.mobileDebugTapCount = 0;
            }, 2000);
          }
          if (this.mobileDebugTapCount >= 7) {
            if (this.mobileDebugTapTimer) window.clearTimeout(this.mobileDebugTapTimer);
            this.mobileDebugTapCount = 0;
            this.ngZone.run(() => {
              this.openDebugMenu();
            });
          }
        }
      });
    });
  }

  ngOnDestroy() {
    this.perfEffect?.destroy();
    this.levelSub?.unsubscribe();
    this.routerSub?.unsubscribe();
    this.playerStats.stopTimer();
    if (this.updateCheckIntervalId) {
      clearInterval(this.updateCheckIntervalId);
    }
  }

  private closeCurrentModal(): void {
    if (this.modalService.currentModal() === 'confirm-dialog') {
      this.modalService.cancel();
      return;
    }

    if (this.modalService.currentModal()) {
      this.modalService.closeModal();
      return;
    }

    if (this.hudPanels.activePanel()) {
      this.hudPanels.close();
    }
  }

  private isEditableTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) {
      return false;
    }

    const tagName = target.tagName;
    return (
      tagName === 'INPUT' ||
      tagName === 'TEXTAREA' ||
      tagName === 'SELECT' ||
      target.isContentEditable
    );
  }

  protected onSplashComplete(): void {
    this.splashVisible.set(false);
    this.options.setGameItem('splash_shown', 'true');
    this.playerStats.startTimer();

    this.supabase.getUser().then(async (r) => {
      if (!r?.data?.user) {
        await this.supabase.signInAnonymously().catch(() => {});
      }
    });

    window.addEventListener('online', async () => {
      try {
        const result = await this.supabase.processPendingScores();
        if (result && result.processed > 0) {
        }
      } catch (e) {
        console.warn('Error:', e);
      }
      this.maybeCheckForUpdate(true);
    });

    if (navigator.onLine) {
      this.supabase.processPendingScores().catch(() => {});
    }

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
  }

  private readonly UPDATE_CHECK_KEY = 'lastUpdateCheck';
  private readonly UPDATE_INTERVAL_MS = 1000 * 60 * 60 * 24; // 24 horas

  private setupDailyUpdateCheck() {
    if (!this.swUpdate?.isEnabled) return;

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
        this.swUpdate
          .activateUpdate()
          .then(() => location.reload())
          .catch(() => {});
      }
    });

    this.maybeCheckForUpdate(false);

    try {
      if (this.updateCheckIntervalId) clearInterval(this.updateCheckIntervalId);
      this.updateCheckIntervalId = window.setInterval(() => {
        this.maybeCheckForUpdate(false);
      }, this.UPDATE_INTERVAL_MS);
    } catch (e) {}
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

  onTutorialFinished() {
    this.tutorialVisible.set(false);
    this.tutorialCompleted.set(true);

    if (this.firstTimeUser()) {
      this.splashVisible.set(true);
    }
  }

  onLanguageSelectionFinished() {
    this.languageSelectionVisible.set(false);
    this.tutorialVisible.set(true);
  }

  private normalizeRoute(url: string): string {
    return url.split('?')[0]?.split('#')[0] || '/';
  }

  private handleMobileContractsRoute(route: string): void {
    if (!this.isMobile || route !== '/contracts') {
      return;
    }

    this.modalService.openModal('contracts');
    this.currentRoute.set('/');
    void this.router.navigateByUrl('/', { replaceUrl: true });
  }
}
