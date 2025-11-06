import { Component } from '@angular/core';
import { CornerCard } from '../../ui/corner-card/corner-card';
import { FormsModule } from '@angular/forms';
import { OptionsService } from '../../services/options.service';

@Component({
  selector: 'app-options',
  imports: [CornerCard, FormsModule],
  templateUrl: './options.html',
  styleUrl: './options.css'
})
export class Options {
  constructor(public optionsService: OptionsService) {}

  restartGame() {
    // TODO: confirmar con modal
    this.optionsService.restartGame()
  }

}
