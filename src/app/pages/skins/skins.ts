import { Component, inject } from '@angular/core';
import { SKINS } from '@data/skin.data';
import { TranslocoModule } from '@jsverse/transloco';
import { SkinCard } from '@ui/skin-card/skin-card';
import { SkinsService } from '@services/skins.service';

@Component({
  selector: 'app-skins',
  standalone: true,
  imports: [SkinCard, TranslocoModule],
  templateUrl: './skins.html',
  styleUrl: './skins.css',
})
/**
 * Componente de la página de skins.
 * Muestra todas las skins disponibles y permite al jugador seleccionarlas
 * si las tiene desbloqueadas.
 */
export class Skins {
  /** Servicio para gestionar las skins y su estado de desbloqueo */
  private skinsService = inject(SkinsService);

  //Array con la lista completa de todas las skins disponibles en el juego.
  skins = SKINS;

  /**
   * Agrupa las skins por su rareza y las ordena.
   * La agrupación sigue un orden predefinido de rareza y luego por el orden o ID de la skin.
   * @returns Un array de objetos, donde cada objeto contiene la clave de la rareza y un array de skins correspondientes.
   */
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

  /**
   * Comprueba si una skin específica ha sido desbloqueada por el jugador.
   * @param skin La skin a comprobar.
   * @returns `true` si la skin está desbloqueada, `false` en caso contrario.
   */
  isSkinUnlocked(skin: any): boolean {
    return this.skinsService.isSkinUnlocked(skin);
  }
}
