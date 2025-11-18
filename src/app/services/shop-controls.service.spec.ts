import { TestBed } from '@angular/core/testing';
import { ShopControlsService, BuyAmount, SortOrder, FilterType } from './shop-controls.service';
import { OptionsService } from './options.service';

describe('ShopControlsService', () => {
  let service: ShopControlsService;
  let optionsServiceSpy: jasmine.SpyObj<OptionsService>;

  // Configuración base antes de cada test
  beforeEach(() => {
    const spy = jasmine.createSpyObj('OptionsService', ['getGameItem', 'setGameItem']);

    TestBed.configureTestingModule({
      providers: [ShopControlsService, { provide: OptionsService, useValue: spy }],
    });
  });

  // Pruebas con la configuración por defecto (storage vacío)
  describe('with default (empty) storage', () => {
    beforeEach(() => {
      optionsServiceSpy = TestBed.inject(OptionsService) as jasmine.SpyObj<OptionsService>;
      service = TestBed.inject(ShopControlsService);
    });

    it('should be created with default values if storage is empty', () => {
      // verificar que el servicio se creó
      expect(service).toBeTruthy();

      // verificar que los spies fueron llamados por el constructor
      expect(optionsServiceSpy.getGameItem).toHaveBeenCalledWith('buyAmount');

      // verificar los valores por defecto
      expect(service.buyAmount()).toBe(1);
    });

    // Pruebas de los métodos set
    describe('State Setters', () => {
      it('setBuyAmount should update signal and call saveToStorage', () => {
        const newAmount: BuyAmount = 25;
        service.setBuyAmount(newAmount);
        expect(service.buyAmount()).toBe(newAmount);
        expect(optionsServiceSpy.setGameItem).toHaveBeenCalledWith('buyAmount', String(newAmount));
      });

      it('setSortOrder should update signal and call saveToStorage', () => {
        const newOrder: SortOrder = 'name';
        expect(optionsServiceSpy.setGameItem).toHaveBeenCalledWith('shopSortOrder', newOrder);
      });

      it('setFilter should update signal and call saveToStorage', () => {
        const newFilter: FilterType = 'affordable';
        expect(optionsServiceSpy.setGameItem).toHaveBeenCalledWith('shopFilter', newFilter);
      });
    });

    // Pruebas del método cycleBuyAmount
    describe('cycleBuyAmount', () => {
      it('should cycle 1 -> 10', () => {
        service.setBuyAmount(1);
        optionsServiceSpy.setGameItem.calls.reset();
        service.cycleBuyAmount();
        expect(service.buyAmount()).toBe(10);
        expect(optionsServiceSpy.setGameItem).toHaveBeenCalledWith('buyAmount', '10');
      });

      it('should cycle 10 -> 25', () => {
        service.setBuyAmount(10);
        optionsServiceSpy.setGameItem.calls.reset();
        service.cycleBuyAmount();
        expect(service.buyAmount()).toBe(25);
        expect(optionsServiceSpy.setGameItem).toHaveBeenCalledWith('buyAmount', '25');
      });

      it('should cycle 25 -> 1', () => {
        service.setBuyAmount(25);
        optionsServiceSpy.setGameItem.calls.reset();
        service.cycleBuyAmount();
        expect(service.buyAmount()).toBe(1);
        expect(optionsServiceSpy.setGameItem).toHaveBeenCalledWith('buyAmount', '1');
      });
    });

    // Pruebas del método reset
    describe('reset', () => {
      it('should reset all signals to their default values', () => {
        service.setBuyAmount(25);

        service.reset();

        expect(service.buyAmount()).toBe(1);
      });
    });
  });

  // Pruebas que requieren sobrescribir el provider (simular storage)
  describe('loadFromStorage on initialization', () => {
    it('should load stored values from storage on construction', () => {
      // Configurar un mock específico para este test
      const storedOptionsSpy = jasmine.createSpyObj('OptionsService', [
        'getGameItem',
        'setGameItem',
      ]);

      // Simular valores válidos en el storage
      storedOptionsSpy.getGameItem.and.callFake((key: string) => {
        if (key === 'buyAmount') return '10';
        return null;
      });

      // Sobrescribir el provider antes de inyectar
      TestBed.overrideProvider(OptionsService, { useValue: storedOptionsSpy });

      // Inyectar el servicio
      const serviceWithStorage = TestBed.inject(ShopControlsService);

      expect(serviceWithStorage.buyAmount()).toBe(10);
    });

    it('should ignore invalid stored values and use defaults', () => {
      const invalidOptionsSpy = jasmine.createSpyObj('OptionsService', [
        'getGameItem',
        'setGameItem',
      ]);

      invalidOptionsSpy.getGameItem.and.callFake((key: string) => {
        if (key === 'buyAmount') return '99'; // Inválido
        return null;
      });

      TestBed.overrideProvider(OptionsService, { useValue: invalidOptionsSpy });
      const invalidService = TestBed.inject(ShopControlsService);
      expect(invalidService.buyAmount()).toBe(1);
    });
  });
});
