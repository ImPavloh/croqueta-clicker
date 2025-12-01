import { Injectable, signal, inject } from '@angular/core';
import { OptionsService } from './options.service';

/** Cantidades de compra disponibles */
export type BuyAmount = 1 | 10 | 25;

/** Opciones de ordenamiento para la tienda */
export type SortOrder = 'default' | 'price-asc' | 'price-desc' | 'name';

/** Tipos de filtro de disponibilidad */
export type FilterType = 'all' | 'affordable';

/** Filtro para mostrar mejoras compradas o no compradas */
export type UpgradesBoughtFilter = 'all' | 'bought' | 'not-bought';

/**
 * Servicio para gestionar los controles de la tienda (productores y mejoras).
 * Maneja la cantidad de compra, filtros y preferencias del usuario.
 */
@Injectable({
  providedIn: 'root',
})
export class ShopControlsService {
  private optionsService = inject(OptionsService);

  /** Signal privado con la cantidad de compra actual */
  private _buyAmount = signal<BuyAmount>(1);

  /** Signal público de solo lectura con la cantidad de compra */
  readonly buyAmount = this._buyAmount.asReadonly();

  /** Mapa de filtros por contexto (upgrades, producers) */
  private _showBoughtFilters = new Map<string, ReturnType<typeof signal>>();

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Establece la cantidad de compra y la persiste.
   * @param amount Nueva cantidad de compra (1, 10 o 25)
   */
  setBuyAmount(amount: BuyAmount) {
    this._buyAmount.set(amount);
    this.saveToStorage();
  }

  /**
   * Establece el filtro de elementos comprados para un contexto específico.
   * @param context Contexto del filtro ('upgrades', 'producers', etc.)
   * @param show true para mostrar solo comprados, false para mostrar todos
   */
  setShowBoughtFilter(context: string, show: boolean) {
    const s = this.ensureFilterSignal(context);
    s.set(show);
    this.saveToStorage();
  }

  /**
   * Alterna el filtro de elementos comprados para un contexto.
   * @param context Contexto del filtro ('upgrades', 'producers', etc.)
   */
  toggleShowBoughtFilter(context: string) {
    const s = this.ensureFilterSignal(context);
    s.update((v) => !v);
    this.saveToStorage();
  }

  /**
   * Cicla entre las cantidades de compra disponibles (1 → 10 → 25 → 1...).
   */
  cycleBuyAmount() {
    const current = this._buyAmount();
    if (current === 1) this.setBuyAmount(10);
    else if (current === 10) this.setBuyAmount(25);
    else this.setBuyAmount(1);
  }

  /**
   * Carga la configuración de los controles desde el almacenamiento local.
   */
  private loadFromStorage() {
    if (typeof localStorage === 'undefined') return;

    // cargar cantidad de compra
    const stored = this.optionsService.getGameItem('buyAmount');
    if (stored === '10' || stored === '25') {
      this._buyAmount.set(Number(stored) as BuyAmount);
    }

    const storedUpgradesFilter = this.optionsService.getGameItem('filterUpgradesBought');
    if (storedUpgradesFilter === 'true') this.ensureFilterSignal('upgrades').set(true);
    else if (storedUpgradesFilter === 'false') this.ensureFilterSignal('upgrades').set(false);

    const storedProducersFilter = this.optionsService.getGameItem('filterProducersBought');
    if (storedProducersFilter === 'true') this.ensureFilterSignal('producers').set(true);
    else if (storedProducersFilter === 'false') this.ensureFilterSignal('producers').set(false);
  }

  private saveToStorage() {
    if (typeof localStorage === 'undefined') return;
    this.optionsService.setGameItem('buyAmount', String(this._buyAmount()));
    const up = this._showBoughtFilters.get('upgrades');
    if (up) this.optionsService.setGameItem('filterUpgradesBought', String(up()));
    const pr = this._showBoughtFilters.get('producers');
    if (pr) this.optionsService.setGameItem('filterProducersBought', String(pr()));
  }

  /**
   * Obtiene el signal del filtro de comprados para un contexto específico.
   * @param context Contexto del filtro
   * @returns Signal de solo lectura con el estado del filtro
   */
  public getShowBoughtFilter(context: string) {
    return this.ensureFilterSignal(context).asReadonly();
  }

  /**
   * Asegura que existe un signal para el contexto especificado.
   * Lo crea si no existe.
   * @param context Contexto del filtro
   * @returns Signal writable del filtro
   */
  private ensureFilterSignal(context: string) {
    if (!this._showBoughtFilters.has(context)) {
      this._showBoughtFilters.set(context, signal<boolean>(false));
    }
    return this._showBoughtFilters.get(context)!;
  }

  /**
   * Reinicia los controles a sus valores por defecto.
   */
  public reset() {
    this._buyAmount.set(1);
  }
}
