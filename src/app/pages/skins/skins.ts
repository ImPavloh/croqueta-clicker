import { Component, inject } from '@angular/core';
import { SKINS } from '@data/skin.data';
import { TranslocoModule } from '@ngneat/transloco';
import { SkinCard } from '@ui/skin-card/skin-card';
import { SkinsService } from '@services/skins.service';

@Component({
  selector: 'app-skins',
  standalone: true,
  imports: [SkinCard, TranslocoModule],
  templateUrl: './skins.html',
  styleUrl: './skins.css',
})
export class Skins {
  private skinsService = inject(SkinsService);
  skins = SKINS;

  // agrupa las skins por su grupo y las ordena por su orden o id
  get groupedSkins() {
    const groups = new Map<string, Array<(typeof SKINS)[number]>>();

    this.skins.forEach((skin) => {
      const key = skin.rarity ?? 'other';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(skin);
    });

    groups.forEach((arr) => {
      arr.sort((a, b) => (a.order ?? a.id) - (b.order ?? b.id));
    });

    const rarityOrder = [
      'skins.rarity.common',
      'skins.rarity.rare',
      'skins.rarity.epic',
      'skins.rarity.legendary',
      'skins.rarity.mythic',
      'other',
    ];

    return Array.from(groups.entries())
      .sort((a, b) => {
        const aIndex = rarityOrder.indexOf(a[0]) === -1 ? 999 : rarityOrder.indexOf(a[0]);
        const bIndex = rarityOrder.indexOf(b[0]) === -1 ? 999 : rarityOrder.indexOf(b[0]);
        return aIndex - bIndex;
      })
      .map(([key, arr]) => ({ key, skins: arr }));
  }

  isSkinUnlocked(skin: any): boolean {
    return this.skinsService.isSkinUnlocked(skin);
  }
}
