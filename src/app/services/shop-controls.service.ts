import { Injectable, signal, inject } from '@angular/core';
import { OptionsService } from './options.service';

export type BuyAmount = 1 | 10 | 25;
export type SortOrder = 'default' | 'price-asc' | 'price-desc' | 'name';
export type FilterType = 'all' | 'affordable';
export type UpgradesBoughtFilter = 'all' | 'bought' | 'not-bought';

@Injectable({
  providedIn: 'root',
})
export class ShopControlsService {
  private optionsService = inject(OptionsService);
  // cantidad de compra actual
  private _buyAmount = signal<BuyAmount>(1);
  readonly buyAmount = this._buyAmount.asReadonly();

  // ver solo upgrades comprados (true) o no comprados (false) por contexto
  private _showBoughtFilters = new Map<string, ReturnType<typeof signal>>();

  constructor() {
    this.loadFromStorage();
  }

  // cambiar la cantidad de compra
  setBuyAmount(amount: BuyAmount) {
    this._buyAmount.set(amount);
    this.saveToStorage();
  }

  setShowBoughtFilter(context: string, show: boolean) {
    const s = this.ensureFilterSignal(context);
    s.set(show);
    this.saveToStorage();
  }

  toggleShowBoughtFilter(context: string) {
    const s = this.ensureFilterSignal(context);
    s.update((v) => !v);
    this.saveToStorage();
  }

  // ciclar entre las opciones de cantidad (1 -> 10 -> 25 ...)
  cycleBuyAmount() {
    const current = this._buyAmount();
    if (current === 1) this.setBuyAmount(10);
    else if (current === 10) this.setBuyAmount(25);
    else this.setBuyAmount(1);
  }

  // Persistencia
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

  public getShowBoughtFilter(context: string) {
    return this.ensureFilterSignal(context).asReadonly();
  }

  private ensureFilterSignal(context: string) {
    if (!this._showBoughtFilters.has(context)) {
      this._showBoughtFilters.set(context, signal<boolean>(false));
    }
    return this._showBoughtFilters.get(context)!;
  }

  public reset() {
    this._buyAmount.set(1);
  }
}
