import { Component, inject } from '@angular/core';
import { GoldenCroquetaService } from '@services/golden-croqueta.service';

@Component({
  selector: 'app-bonus-countdown-popup',
  standalone: true,
  templateUrl: './bonus-countdown-popup.html',
  styleUrls: ['./bonus-countdown-popup.css'],
})
export class BonusCountdownPopup {
  protected goldenCroquetaService = inject(GoldenCroquetaService);
}