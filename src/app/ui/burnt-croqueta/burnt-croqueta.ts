import { Component, inject } from '@angular/core';
import { BurntCroquetaService } from '@services/burnt-croqueta.service';
import { AudioService } from '@services/audio.service';

@Component({
  selector: 'app-burnt-croqueta',
  standalone: true,
  templateUrl: './burnt-croqueta.html',
  styleUrls: ['./burnt-croqueta.css'],
})
export class BurntCroqueta {
  protected burntService = inject(BurntCroquetaService);
  private audioService = inject(AudioService);

  onClick() {
    this.burntService.clicked();
    this.audioService.playSfx('/assets/sfx/click01.mp3', 1);
  }
}
