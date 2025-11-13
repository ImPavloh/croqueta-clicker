import { Component } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { NewsLine } from '@ui/newsline/newsline';
import { ButtonComponent } from '@ui/button/button';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, RouterLink, NewsLine, ButtonComponent],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  public isMobile: boolean = window.innerWidth <= 1344;
}
