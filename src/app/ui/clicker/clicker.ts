import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PointsService } from '../../services/points.service';
import { Floating } from '../floating/floating';
import { SkinsService } from '../../services/skins.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-clicker',
  imports: [CommonModule, Floating],
  templateUrl: './clicker.html',
  styleUrl: './clicker.css',
})
export class Clicker {
  croquetaClass = '';
  private skinSub?: Subscription;
  
  constructor(public pointsService: PointsService, private skinsService: SkinsService) { }

  onClick() {
    this.pointsService.addPointsPerClick();
    // guardar puntos tras cada click
    this.pointsService.saveToStorage();
  }

  ngOnInit() {
    // suscribirse a los cambios del skin
    this.skinSub = this.skinsService.skinChanged$.subscribe(id => {
      this.updateCroquetaStyle(id);
    });

    // inicializar con el valor actual
    this.updateCroquetaStyle(this.skinsService.skinId());
  }

  preventKey(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  updateCroquetaStyle(id: number) {
    switch (id) {
      case 1:
        this.croquetaClass = 'croqueta-normal';
        break;
      case 2:
        this.croquetaClass = 'croqueta-jamon';
        break;
      case 3:
        this.croquetaClass = 'croqueta-pollo';
        break;
      case 4:
        this.croquetaClass = 'croqueta-queso';
        break;
      case 5:
        this.croquetaClass = 'croqueta-bacalao';
        break;
      case 6:
        this.croquetaClass = 'croqueta-setas';
        break;
      case 7:
        this.croquetaClass = 'croqueta-dorada';
        break; 
      default:
        this.croquetaClass = 'croqueta-normal';
        break;
    }
  }

  ngOnDestroy() {
    this.skinSub?.unsubscribe(); // limpiar la suscripción
  }
}
