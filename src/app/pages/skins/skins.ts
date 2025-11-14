import { Component, inject } from '@angular/core';
import { SKINS } from '@data/skin.data';
import { SkinCard } from '@ui/skin-card/skin-card';
import { SkinsService } from '@services/skins.service';

@Component({
  selector: 'app-skins',
  imports: [SkinCard],
  templateUrl: './skins.html',
  styleUrl: './skins.css',
})
export class Skins {
  private skinsService = inject(SkinsService);
  skins = SKINS;

  isSkinUnlocked(skin: any): boolean {
    return this.skinsService.isSkinUnlocked(skin);
  }
}
