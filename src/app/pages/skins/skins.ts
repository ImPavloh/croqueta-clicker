import { Component } from '@angular/core';
import { SKINS } from '@data/skin.data';
import { SkinCard } from '@ui/skin-card/skin-card';

@Component({
  selector: 'app-skins',
  imports: [SkinCard],
  templateUrl: './skins.html',
  styleUrl: './skins.css',
})
export class Skins {
  skins =  SKINS;
}
