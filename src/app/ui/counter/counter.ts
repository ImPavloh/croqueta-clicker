import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PointsService } from '@services/points.service';
import { SkinsService } from '@services/skins.service';
import { ShortNumberPipe } from '@pipes/short-number.pipe';
import { SKINS } from '@data/skin.data';

@Component({
  selector: 'app-counter',
  imports: [CommonModule, ShortNumberPipe],
  templateUrl: './counter.html',
  styleUrl: './counter.css',
})
export class Counter {
  skins = SKINS;

  constructor(public pointsService: PointsService, private skinsService: SkinsService) {}

  getCounterLabel(): string {
    const currentSkinId = this.skinsService.skinId();
    const skin = this.skins.find((s) => s.id === currentSkinId);
    return skin?.counterLabel || 'croquetas';
  }
}
