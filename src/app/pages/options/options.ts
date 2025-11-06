import { Component } from '@angular/core';
import { CornerCard } from '@ui/corner-card/corner-card';
import { FormsModule } from '@angular/forms';
import { OptionsService } from '@services/options.service';
import { PlayerStats } from '@services/player-stats.service';
import { PointsService } from '@services/points.service';

@Component({
  selector: 'app-options',
  imports: [CornerCard, FormsModule],
  templateUrl: './options.html',
  styleUrl: './options.css'
})
export class Options {
  constructor(
    public optionsService: OptionsService,
    private playerStats: PlayerStats,
    private pointsService: PointsService
  ) {}

  restartGame() {
    // TODO: confirmar con modal
    this.optionsService.restartGame()
  }

  shareGame() {
    const totalClicks = this.playerStats.totalClicks();
    const timePlaying = this.formatTime(this.playerStats.timePlaying());
    const level = this.playerStats._level.getValue();
    const croquetas = Math.floor(this.pointsService.points());
    const croquetasPerSecond = this.pointsService.pointsPerSecond().toFixed(1);

    const shareText = `¡Mira mi progreso en Croqueta Clicker!\n\n` +
      `🖱️ Clicks totales: ${totalClicks.toLocaleString()}\n` +
      `⏱️ Tiempo jugado: ${timePlaying}\n` +
      `⭐ Nivel: ${level}\n` +
      `🥐 Croquetas: ${croquetas.toLocaleString()}\n` +
      `⚡ Croquetas/seg: ${croquetasPerSecond}`;

    if (navigator.share) {
      navigator.share({
        title: 'Mi progreso en Croqueta Clicker',
        text: shareText
      }).catch(() => {
        this.copyToClipboard(shareText);
      });
    } else {
      this.copyToClipboard(shareText);
    }
  }

  private copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      alert('¡Estadísticas copiadas al portapapeles!');
    })
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
