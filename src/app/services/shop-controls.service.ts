import { Injectable, signal } from '@angular/core';

export type BuyAmount = 1 | 10 | 100;
export type SortOrder = 'default' | 'price-asc' | 'price-desc' | 'name';
export type FilterType = 'all' | 'affordable' | 'owned';

@Injectable({
  providedIn: 'root',
})
export class ShopControlsService {
  // cantidad de compra actual
  private _buyAmount = signal<BuyAmount>(1);
  readonly buyAmount = this._buyAmount.asReadonly();

  // orden de clasificación
  private _sortOrder = signal<SortOrder>('default');
  readonly sortOrder = this._sortOrder.asReadonly();

  // filtro activo
  private _filter = signal<FilterType>('all');
  readonly filter = this._filter.asReadonly();

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

  // ciclar entre las opciones de cantidad (1 -> 10 -> 100 ...)
  cycleBuyAmount() {
    const current = this._buyAmount();
    if (current === 1) this.setBuyAmount(10);
    else if (current === 10) this.setBuyAmount(100);
    else this.setBuyAmount(1);
  }

  // Persistencia
  private loadFromStorage() {
    if (typeof localStorage === 'undefined') return;

    // cargar cantidad de compra
    const stored = localStorage.getItem('buyAmount');
    if (stored === '10' || stored === '100') {
      this._buyAmount.set(Number(stored) as BuyAmount);
    }

    // cargar orden
    const storedSort = localStorage.getItem('shopSortOrder') as SortOrder;
    if (storedSort && ['default', 'price-asc', 'price-desc', 'name'].includes(storedSort)) {
      this._sortOrder.set(storedSort);
    }

    // cargar filtro
    const storedFilter = localStorage.getItem('shopFilter') as FilterType;
    if (storedFilter && ['all', 'affordable', 'owned'].includes(storedFilter)) {
      this._filter.set(storedFilter);
    }
  }

  private saveToStorage() {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem('buyAmount', String(this._buyAmount()));
    localStorage.setItem('shopSortOrder', this._sortOrder());
    localStorage.setItem('shopFilter', this._filter());
  }
}
