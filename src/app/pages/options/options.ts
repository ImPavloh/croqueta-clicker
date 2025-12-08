import { ToggleSwitchControlModel } from './../../models/ui-controls.model';
import { Component, inject, Input } from '@angular/core';
import { Card } from '@ui/card/card';
import { FormsModule } from '@angular/forms';
import { Tooltip } from '@ui/tooltip/tooltip';
import { OptionsService } from '@services/options.service';
import { ModalService } from '@services/modal.service';
import { PlayerStats } from '@services/player-stats.service';
import { PointsService } from '@services/points.service';
import { ButtonComponent } from '@ui/button/button';
import { AutosaveService } from '@services/autosave.service';
import { SkinsService } from '@services/skins.service';
import { ShopControlsService } from '@services/shop-controls.service';
import { ShortNumberPipe } from '@pipes/short-number.pipe';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AchievementsService } from '@services/achievements.service';
import { SupabaseService } from '@services/supabase.service';
import { DebugService } from '@services/debug.service';

import PackageJson from '../../../../package.json';
import { RangeSliderControlModel, UiControlModel } from '@models/ui-controls.model';
import { INTERFACE_CONTROL, VOLUMEN_CONTROL } from '@data/ui-controls.data';
import { DynamicControls } from '@ui/dynamic-controls/dynamic-controls';

@Component({
  selector: 'app-options',
  standalone: true,
  imports: [Card, FormsModule, ButtonComponent, Tooltip, TranslocoModule, DynamicControls],
  templateUrl: './options.html',
  styleUrl: './options.css',
})
/**
 * Componente de la página de opciones.
 * Permite al jugador configurar volumen, gráficos, idioma y gestionar su partida.
 */
export class Options {
  private shortNumberPipe = new ShortNumberPipe();

  //Versión de la aplicación, obtenida desde el fichero package.json.
  version = PackageJson.version;

  volumenControls = VOLUMEN_CONTROL;
  interfaceControls = INTERFACE_CONTROL;

  //Servicio para gestionar las opciones del juego.
  public optionsService = inject(OptionsService);
  //Servicio para mostrar modales de confirmación.
  private modalService = inject(ModalService);
  //Servicio para gestionar las estadísticas del jugador.
  private playerStats = inject(PlayerStats);
  //Servicio para gestionar los puntos (croquetas).
  private pointsService = inject(PointsService);
  //Servicio para el guardado automático y manual.
  private autosaveService = inject(AutosaveService);
  //Servicio para gestionar las skins.
  private skinsService = inject(SkinsService);
  //Servicio para los controles de la tienda.
  private shopControlsService = inject(ShopControlsService);
  //Servicio para la internacionalización.
  private translocoService = inject(TranslocoService);
  //Servicio para gestionar los logros.
  private achievementsService = inject(AchievementsService);
  //Servicio para la interacción con la base de datos de Supabase (leaderboard).
  private supabase = inject(SupabaseService);
  //Servicio para gestionar el modo debug.
  private debugService = inject(DebugService);

  /**
   * Método del ciclo de vida de Angular. Se ejecuta al iniciar el componente.
   * Carga el idioma guardado por el usuario.
   */
  ngOnInit() {
    this.setSavedLang();
  }

  /**
   * Muestra un modal de confirmación para reiniciar el juego. Si se confirma,
   * borra los datos locales y remotos (leaderboard) y reinicia el estado del juego.
   */
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
  /**
   * Guarda manualmente el progreso actual del juego utilizando el `AutosaveService`
   * y muestra un modal de confirmación con el resultado de la operación.
   */
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
  /**
   * Exporta el progreso del juego a un fichero. Primero guarda el estado actual
   * y luego invoca al servicio de opciones para generar y descargar el archivo.
   */
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

  /**
   * Abre un diálogo para que el usuario seleccione un fichero de guardado (`.croqueta`).
   * Si se selecciona un fichero, muestra un modal de confirmación antes de importarlo y reemplazar la partida actual.
   */
  importProgress() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.croqueta';

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

  /**
   * Recopila las estadísticas actuales del jugador y utiliza la API `navigator.share` para compartirlas.
   * Si la API no está disponible, copia las estadísticas al portapapeles.
   */
  shareGame() {
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

  /** Contador de clicks en el nombre del estudio. */
  studioClicked = 0;
  /**
   * Incrementa el contador de clicks en el nombre del estudio y desbloquea logros secretos al alcanzar ciertos umbrales.
   */
  clickOnStudio() {
    this.studioClicked++;
    if (this.studioClicked >= 2) {
      this.achievementsService.unlockAchievement('fanboy');
    }
    if (this.studioClicked >= 10) {
      this.achievementsService.unlockAchievement('certified_obsession');
    }
  }

  /**
   * Cambia el idioma activo del juego y lo guarda en el almacenamiento local.
   * @param lang El código del idioma a activar (ej. 'es', 'en').
   */
  changeLanguage(lang: string) {
    this.translocoService.setActiveLang(lang);
    // si no hay localStorage, no hacer nada
    if (typeof localStorage === 'undefined') return;
    // guardar lang como string
    this.optionsService.setGameItem('lang', lang);
  }

  /**
   * Carga y establece el idioma guardado en el almacenamiento local al iniciar la aplicación.
   */
  setSavedLang() {
    // si no hay localStorage, no hacer nada
    if (typeof localStorage === 'undefined') return;
    // cargar lang
    const savedLang = this.optionsService.getGameItem('lang');
    if (savedLang) {
      this.translocoService.setActiveLang(savedLang);
    }
  }

  /**
   * Copia un texto al portapapeles del usuario y muestra una alerta de confirmación.
   * @param text El texto a copiar.
   */
  private copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      alert(this.translocoService.translate('options.shareGameModal.clipboardMessage'));
    });
  }

  /**
   * Formatea un número de segundos a un string legible en formato `Xh Ym Zs`.
   * @param seconds El número de segundos a formatear.
   * @returns El tiempo formateado como string.
   */
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

  /**
   * Muestra un modal de confirmación para repetir el tutorial. Si se confirma,
   * elimina las marcas de tutorial completado y recarga la página.
   */
  replayTutorial() {
    this.modalService.showConfirm({
      title: this.translocoService.translate('options.replayTutorialModal.title'),
      message: this.translocoService.translate('options.replayTutorialModal.message'),
      confirmText: this.translocoService.translate('options.replayTutorialModal.confirmText'),
      cancelText: this.translocoService.translate('options.replayTutorialModal.cancelText'),
      onConfirm: () => {
        this.optionsService.removeGameItem('tutorial_completed');
        this.optionsService.removeGameItem('splash_shown');
        setTimeout(() => {
          window.location.reload();
        }, 80);
      },
    });
  }

  onControlChange(control: UiControlModel, value: any) {
    switch (control.controlType) {
      case 'range-slider':
        this.handleVolumeChange(control as RangeSliderControlModel, value);
        break;
      case 'toggle-switch':
        this.handleToggleChange(control as ToggleSwitchControlModel, value);
        break;
    }
  }

  private handleVolumeChange(control: RangeSliderControlModel, value: number) {
    const label = control.label;
    if (label === 'options.generalVolumeLabel') {
      this.optionsService.setGeneralVolume(value);
    } else if (label === 'options.musicVolumeLabel') {
      this.optionsService.setMusicVolume(value);
    } else if (label === 'options.sfxVolumeLabel') {
      this.optionsService.setSfxVolume(value);
    }
  }

  private handleToggleChange(control: ToggleSwitchControlModel, checked: boolean) {
    const label = control.label;
    if (label === 'options.showMascotLabel') {
      this.optionsService.setShowCroquetita(checked);
    } else if (label === 'options.showParticlesLabel') {
      this.optionsService.setShowParticles(checked);
    } else if (label === 'options.showFloatingPointsLabel') {
      this.optionsService.setShowFloatingText(checked);
    }
  }
}
