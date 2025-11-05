import { Component, computed } from '@angular/core';
import { PlayerStats } from '../../services/player-stats.service';
import { StatCardComponent, StatCardConfig } from "../../ui/stat-card/stat-card";
import { CommonModule } from '@angular/common';
import { PageContainer } from '../../ui/page-container/page-container';

@Component({
  selector: 'app-stats',
  imports: [StatCardComponent, CommonModule, PageContainer],
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
    title: 'Tiempo jugado',
    value: this.playerStats.timePlaying(),
    icon: 'reloj',
    format: 'time'
  }));

  levelCurrent = computed<StatCardConfig> (() => ({
    title: 'Nivel: ',
    value: this.playerStats.level(),
    icon: 'level',
    format: 'number'
  }));

  expNecessary = computed<StatCardConfig> (() => ({
    title: 'Próximo Nivel: ',
    value: this.playerStats.currentExp()/this.playerStats.expToNext(),
    icon: 'level',
    format: 'percentage'
  }));
}
