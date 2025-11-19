import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { NewsLine } from '@ui/newsline/newsline';
import { ButtonComponent } from '@ui/button/button';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, RouterLink, NewsLine, ButtonComponent],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  // Inicializamos la propiedad con una comprobación inmediata
  public isMobile: boolean = window.innerWidth <= 1344;

  // 🛠️ HostListener detecta automáticamente cuando se redimensiona la ventana
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.isMobile = window.innerWidth <= 1344;
  }
}
