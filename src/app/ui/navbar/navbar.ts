import { Component, inject } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { AudioService } from '@services/audio.service';
import { NewsLine } from '@ui/newsline/newsline';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, RouterLink, NewsLine],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  public isMobile: boolean = window.innerWidth <= 1024;
  private audioService = inject(AudioService);

  onClick(){
    this.audioService.playSfx("/assets/sfx/click02.mp3",1)
  }
}
