import { Component } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { NewsLine } from '@ui/newsline/newsline';

@Component({
  selector: 'app-navbar',
  imports: [ RouterModule, RouterLink, NewsLine],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {

}
