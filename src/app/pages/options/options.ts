import { Component, inject } from '@angular/core';
import { Card } from '@ui/card/card';
import { FormsModule } from '@angular/forms';
import { Tooltip } from '@ui/tooltip/tooltip';
import { OptionsService } from '@services/options.service';
import { ModalService } from '@services/modal.service';
import { PlayerStats } from '@services/player-stats.service';
import { PointsService } from '@services/points.service';
import { ButtonComponent } from '@ui/button/button';
import { RangeSlider } from '@ui/range-slider/range-slider';
import { ToggleSwitch } from '@ui/toggle-switch/toggle-switch';
import { AutosaveService } from '@services/autosave.service';
import { SkinsService } from '@services/skins.service';
import { ShopControlsService } from '@services/shop-controls.service';
import { ShortNumberPipe } from '@pipes/short-number.pipe';
import { AudioService } from '@services/audio.service';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AchievementsService } from '@services/achievements.service';
import { SupabaseService } from '@services/supabase.service';
import { DebugService } from '@services/debug.service';

@Component({
  selector: 'app-options',
  standalone: true,
  imports: [
    Card,
    FormsModule,
    ButtonComponent,
    RangeSlider,
    ToggleSwitch,
    Tooltip,
    TranslocoModule,
  ],
  templateUrl: './options.html',
  styleUrl: './options.css',
})
export class Options {
  private shortNumberPipe = new ShortNumberPipe();
  private audioService = inject(AudioService);

  constructor(
    public optionsService: OptionsService,
    private modalService: ModalService,
    private playerStats: PlayerStats,
    private pointsService: PointsService,
    private autosaveService: AutosaveService,
    private skinsService: SkinsService,
    private shopControlsService: ShopControlsService,
    private translocoService: TranslocoService,
    private achievementsService: AchievementsService,
    private supabase: SupabaseService,
    private debugService: DebugService
  ) {}

  ngOnInit() {
    this.setSavedLang();
  }

  restartGame() {
    this.modalService.showConfirm({
      title: this.translocoService.translate('options.resetGameModal.title'),
      message: this.translocoService.translate('options.resetGameModal.message'),
      confirmText: this.translocoService.translate('options.resetGameModal.confirmText'),
      cancelText: this.translocoService.translate('options.resetGameModal.cancelText'),
      onConfirm: async () => {
        // intentar limpiar la entrada del leaderboard remoto y cerrar sesión
        try {
          if (!this.debugService?.isDebugMode) {
            const del = await this.supabase.deleteOwnLeaderboardEntry();
            // cerrar la sesión actual (se creara una nueva sesion después del reinicio)
            await this.supabase.signOut();
          }
        } catch (e) {
          console.warn('Error:', e);
        }

        this.pointsService.reset();
        this.playerStats.reset();
        this.skinsService.reset();
        this.shopControlsService.reset();
        this.optionsService.resetOptions();
        this.optionsService.restartGame();

        // asegurar que se cree una nueva sesión anónima para que la aplicación pueda continuar usando los flujos del leaderboard
        try {
          await this.supabase.signInAnonymously();
        } catch {
          // ignorar y rezar para que funcione
        }
      },
    });
  }

  // Guardar manualmente el progreso actual
  saveProgress() {
    const success = this.autosaveService.saveManually();

    this.modalService.showConfirm({
      title: success
        ? this.translocoService.translate('options.saveGameModal.successTitle')
        : this.translocoService.translate('options.saveGameModal.errorTitle'),
      message: success
        ? this.translocoService.translate('options.saveGameModal.successMessage')
        : this.translocoService.translate('options.saveGameModal.errorMessage'),
      confirmText: this.translocoService.translate('options.saveGameModal.confirmText'),
      cancelText: '',
      onConfirm: () => {},
    });
  }

  // mostrar diálogo para exportar partida no un alert sino el modal:
  exportProgress() {
    try {
      // Primero guardamos el estado actual antes de exportar
      this.autosaveService.saveManually();

      this.optionsService.exportProgress();
      // Mostrar un modal en lugar de alert
      this.modalService.showConfirm({
        title: this.translocoService.translate('options.exportGameModal.successTitle'),
        message: this.translocoService.translate('options.exportGameModal.successMessage'),
        confirmText: this.translocoService.translate('options.exportGameModal.confirmText'),
        cancelText: '',
        onConfirm: () => {},
      });
    } catch (error) {
      this.modalService.showConfirm({
        title: this.translocoService.translate('options.exportGameModal.errorTitle'),
        message: this.translocoService.translate('options.exportGameModal.errorMessage') + error,
        confirmText: this.translocoService.translate('options.exportGameModal.confirmText'),
        cancelText: '',
        onConfirm: () => {},
      });
    }
  }

  importProgress() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        this.modalService.showConfirm({
          title: this.translocoService.translate('options.importGameModal.title'),
          message: this.translocoService.translate('options.importGameModal.message'),
          confirmText: this.translocoService.translate('options.importGameModal.confirmText'),
          cancelText: this.translocoService.translate('options.importGameModal.cancelText'),
          onConfirm: () => {
            this.autosaveService.setImporting(true);

            this.optionsService
              .importProgress(file)
              .then(() => {
                setTimeout(() => {
                  window.location.replace(window.location.origin + window.location.pathname);
                }, 100);
              })
              .catch((error) => {
                this.autosaveService.setImporting(false);
                this.modalService.showConfirm({
                  title: this.translocoService.translate('options.importGameModal.errorTitle'),
                  message:
                    this.translocoService.translate('options.importGameModal.errorMessage') + error,
                  confirmText: this.translocoService.translate(
                    'options.importGameModal.confirmTextError'
                  ),
                  onConfirm: () => {},
                });
              });
          },
        });
      }
    };

    input.click();
  }

  shareGame() {
    this.audioService.playSfx('/assets/sfx/click02.mp3', 1);
    const totalClicks = this.shortNumberPipe.transform(this.playerStats.totalClicks(), 0);
    const timePlaying = this.formatTime(this.playerStats.timePlaying());
    const level = this.playerStats._level.getValue();
    const croquetas = this.shortNumberPipe.transform(this.pointsService.points(), 0);
    const croquetasPerSecond = this.shortNumberPipe.transform(
      this.pointsService.pointsPerSecond(),
      1
    );

    const shareText = this.translocoService.translate('options.shareGameModal.text', {
      totalClicks,
      timePlaying,
      level,
      croquetas,
      croquetasPerSecond,
    });

    if (navigator.share) {
      navigator
        .share({
          title: this.translocoService.translate('options.shareGameModal.title'),
          text: shareText,
        })
        .catch(() => {
          this.copyToClipboard(shareText);
        });
    } else {
      this.copyToClipboard(shareText);
    }
  }

  studioClicked = 0;
  clickOnStudio() {
    this.studioClicked++;
    if (this.studioClicked >= 10) {
      this.achievementsService.unlockAchievement('fanboy');
    }
    if (this.studioClicked >= 1000) {
      this.achievementsService.unlockAchievement('certified_obsession');
    }
  }

  changeLanguage(lang: string) {
    this.translocoService.setActiveLang(lang);
    // si no hay localStorage, no hacer nada
    if (typeof localStorage === 'undefined') return;
    // guardar lang como string
    this.optionsService.setGameItem('lang', lang);
  }

  setSavedLang() {
    // si no hay localStorage, no hacer nada
    if (typeof localStorage === 'undefined') return;
    // cargar lang
    const savedLang = this.optionsService.getGameItem('lang');
    if (savedLang) {
      this.translocoService.setActiveLang(savedLang);
    }
  }

  private copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      alert(this.translocoService.translate('options.shareGameModal.clipboardMessage'));
    });
  }

  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }
}
