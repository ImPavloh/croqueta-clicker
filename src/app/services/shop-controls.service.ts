import { Injectable, signal, inject } from '@angular/core';
import { OptionsService } from './options.service';

export type BuyAmount = 1 | 10 | 25;
export type SortOrder = 'default' | 'price-asc' | 'price-desc' | 'name';
export type FilterType = 'all' | 'affordable';

@Injectable({
  providedIn: 'root',
})
export class ShopControlsService {
  private optionsService = inject(OptionsService);
  // cantidad de compra actual
  private _buyAmount = signal<BuyAmount>(1);
  readonly buyAmount = this._buyAmount.asReadonly();

  // orden de clasificación
  private _sortOrder = signal<SortOrder>('default');
  readonly sortOrder = this._sortOrder.asReadonly();

  // filtro activo
  private _filter = signal<FilterType>('all');
  readonly filter = this._filter.asReadonly();

  // vista de la tienda: lista-grid
  private _gridView = signal<boolean>(false);
  readonly gridView = this._gridView.asReadonly();

  constructor() {
    this.loadFromStorage();
  }

  // cambiar la cantidad de compra
  setBuyAmount(amount: BuyAmount) {
    this._buyAmount.set(amount);
    this.saveToStorage();
  }

  // cambiar el orden
  setSortOrder(order: SortOrder) {
    this._sortOrder.set(order);
    this.saveToStorage();
  }

  // cambiar el filtro
  setFilter(filter: FilterType) {
    this._filter.set(filter);
    this.saveToStorage();
  }

  // cambiar layout de vista a grid o lista
  setGridView(value: boolean) {
    this._gridView.set(value);
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

    // cargar orden
    const storedSort = this.optionsService.getGameItem('shopSortOrder') as SortOrder;
    if (storedSort && ['default', 'price-asc', 'price-desc', 'name'].includes(storedSort)) {
      this._sortOrder.set(storedSort);
    }

    // cargar filtro
    const storedFilter = this.optionsService.getGameItem('shopFilter') as FilterType;
    if (storedFilter && ['all', 'affordable'].includes(storedFilter)) {
      this._filter.set(storedFilter);
    }

    // cargar vista grid
    const storedGrid = this.optionsService.getGameItem('shopGridView');
    if (storedGrid === 'true' || storedGrid === 'false') {
      this._gridView.set(storedGrid === 'true');
    }
  }

  private saveToStorage() {
    if (typeof localStorage === 'undefined') return;
    this.optionsService.setGameItem('buyAmount', String(this._buyAmount()));
    this.optionsService.setGameItem('shopSortOrder', this._sortOrder());
    this.optionsService.setGameItem('shopFilter', this._filter());
    this.optionsService.setGameItem('shopGridView', String(this._gridView()));
  }

  public reset() {
    this._buyAmount.set(1);
    this._sortOrder.set('default');
    this._filter.set('all');
    this._gridView.set(false);
  }
}
