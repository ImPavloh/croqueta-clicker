import { Component, inject } from '@angular/core';
import { CornerCard } from '@ui/corner-card/corner-card';
import { FormsModule } from '@angular/forms';
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

@Component({
  selector: 'app-options',
  imports: [CornerCard, FormsModule, ButtonComponent, RangeSlider, ToggleSwitch],
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
    private shopControlsService: ShopControlsService
  ) {}

  restartGame() {
    this.modalService.showConfirm({
      title: 'Reiniciar partida',
      message:
        '¿Estás seguro de que quieres reiniciar tu progreso? Esta acción no se puede deshacer y perderás todas tus croquetas, mejoras y estadísticas.',
      confirmText: 'Sí, reiniciar',
      cancelText: 'Cancelar',
      onConfirm: () => {
        // Resetear TODOS los servicios en memoria ANTES de borrar localStorage
        this.pointsService.reset();
        this.playerStats.reset();
        this.skinsService.reset();
        this.shopControlsService.reset();
        this.optionsService.resetOptions();

        // Ahora resetear localStorage y achievements, luego recargar
        this.optionsService.restartGame();
      },
    });
  }

  // Guardar manualmente el progreso actual
  saveProgress() {
    const success = this.autosaveService.saveManually();

    this.modalService.showConfirm({
      title: success ? 'Partida guardada' : 'Error al guardar',
      message: success
        ? '¡Tu progreso se ha guardado correctamente en el navegador!'
        : 'Hubo un error al guardar. Por favor, intenta de nuevo.',
      confirmText: 'Aceptar',
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
        title: 'Partida descargada',
        message: 'La partida se ha descargado correctamente.',
        confirmText: 'Aceptar',
        cancelText: '',
        onConfirm: () => {},
      });
    } catch (error) {
      this.modalService.showConfirm({
        title: 'Error',
        message: 'Error al descargar la partida: ' + error,
        confirmText: 'Aceptar',
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
          title: 'Importar partida',
          message: `¿Quieres cargar esta partida? Tu progreso actual será reemplazado completamente.`,
          confirmText: 'Cargar',
          cancelText: 'Cancelar',
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
                  title: 'Error',
                  message: 'Error al cargar la partida: ' + error,
                  confirmText: 'Aceptar',
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

    const shareText =
      `¡Mira mi progreso en Croqueta Clicker!\n\n` +
      `🖱️ Clicks totales: ${totalClicks}\n` +
      `⏱️ Tiempo jugado: ${timePlaying}\n` +
      `⭐ Nivel: ${level}\n` +
      `🥐 Croquetas: ${croquetas}\n` +
      `⚡ Croquetas/seg: ${croquetasPerSecond}`;

    if (navigator.share) {
      navigator
        .share({
          title: 'Mi progreso en Croqueta Clicker',
          text: shareText,
        })
        .catch(() => {
          this.copyToClipboard(shareText);
        });
    } else {
      this.copyToClipboard(shareText);
    }
  }

  private copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      alert('¡Estadísticas copiadas al portapapeles!');
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
