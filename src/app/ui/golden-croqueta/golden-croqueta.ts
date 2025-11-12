import { Component, inject } from '@angular/core';
import { GoldenCroquetaService } from '@services/golden-croqueta.service';

@Component({
  selector: 'app-golden-croqueta',
  standalone: true,
  templateUrl: './golden-croqueta.html',
  styleUrls: ['./golden-croqueta.css'],
})
export class GoldenCroqueta {
  protected goldenCroquetaService = inject(GoldenCroquetaService);

  onClick() {
    this.goldenCroquetaService.clicked();
  }
}