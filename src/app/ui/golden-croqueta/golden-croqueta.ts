import { Component, inject } from '@angular/core';
import { GoldenCroquetaService } from '@services/golden-croqueta.service';
import { AudioService } from '@services/audio.service';

@Component({
  selector: 'app-golden-croqueta',
  standalone: true,
  templateUrl: './golden-croqueta.html',
  styleUrls: ['./golden-croqueta.css'],
})
export class GoldenCroqueta {
  protected goldenCroquetaService = inject(GoldenCroquetaService);
  private audioService = inject(AudioService);

  onClick() {
    this.goldenCroquetaService.clicked();
    this.audioService.playSfx('/assets/sfx/click01.mp3', 1);
  }
}
