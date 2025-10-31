import { PlayerStats } from './../../services/player-stats';
import { Component } from '@angular/core';
import { Stat } from '../../ui/stat/stat';
import { StatCardComponent,StatCardConfig } from "../../ui/stat-card/stat-card";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats',
  imports: [Stat, StatCardComponent, CommonModule,],
  templateUrl: './stats.html',
  styleUrl: './stats.css',
})
export class Stats {
  constructor(public playerStats: PlayerStats){}

  statConfig: StatCardConfig = {
    title: 'Clicks Totales',
    value: this.playerStats.totalClicks(),
    description: 'En las últimas 24 horas',
    icon: 'person',
    format: 'number'
  };
}
