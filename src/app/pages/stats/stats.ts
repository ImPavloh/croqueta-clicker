import { Component, computed } from '@angular/core';
import { PlayerStats } from '../../services/player-stats.service';
import { StatCardComponent, StatCardConfig } from "../../ui/stat-card/stat-card";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats',
  imports: [StatCardComponent, CommonModule],
  templateUrl: './stats.html',
  styleUrl: './stats.css',
})
export class Stats {
  constructor(public playerStats: PlayerStats) {}

  // Usar computed para que se actualice automáticamente
  totalClicksView = computed<StatCardConfig>(() => ({
    title: 'Clicks Totales',
    value: this.playerStats.totalClicks(),
    icon: 'person',
    format: 'number'
  }));

  totalTimePlaying = computed<StatCardConfig> (() => ({
    title: 'Timepo jugado',
    value: this.playerStats.timePlaying(),
    icon: 'reloj',
    format: 'time'
  }));
}
