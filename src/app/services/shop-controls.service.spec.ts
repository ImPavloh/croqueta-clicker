// shop-controls.service.spec.ts

import { TestBed } from '@angular/core/testing';
import { ShopControlsService, BuyAmount, SortOrder, FilterType } from './shop-controls.service';
import { OptionsService } from './options.service';

describe('ShopControlsService', () => {
  let service: ShopControlsService;
  let optionsServiceSpy: jasmine.SpyObj<OptionsService>;

  // Configuración base ANTES de cada test
  beforeEach(() => {
    // Crear un spy object para OptionsService
    const spy = jasmine.createSpyObj('OptionsService', ['getGameItem', 'setGameItem']);

    // Configurar el módulo de testing.
    // NOTA: No se llama a TestBed.inject() aquí.
    TestBed.configureTestingModule({
      providers: [
        ShopControlsService,
        { provide: OptionsService, useValue: spy }
      ]
    });
  });

  // --- Pruebas con la configuración por defecto (storage vacío) ---
  describe('with default (empty) storage', () => {
    
    // Inyectar los servicios AHORA. Esto instancia el TestBed
    // con el spy por defecto (que devuelve undefined).
    beforeEach(() => {
      optionsServiceSpy = TestBed.inject(OptionsService) as jasmine.SpyObj<OptionsService>;
      service = TestBed.inject(ShopControlsService);
    });

    it('should be created with default values if storage is empty', () => {
      // Verificar que el servicio se creó
      expect(service).toBeTruthy();
      
      // Verificar que los spies fueron llamados por el constructor
      expect(optionsServiceSpy.getGameItem).toHaveBeenCalledWith('buyAmount');
      expect(optionsServiceSpy.getGameItem).toHaveBeenCalledWith('shopSortOrder');
      expect(optionsServiceSpy.getGameItem).toHaveBeenCalledWith('shopFilter');
      
      // Verificar los valores por defecto
      expect(service.buyAmount()).toBe(1);
      expect(service.sortOrder()).toBe('default');
      expect(service.filter()).toBe('all');
    });

    // Pruebas de los métodos 'set'
    describe('State Setters', () => {
      it('setBuyAmount should update signal and call saveToStorage', () => {
        const newAmount: BuyAmount = 25;
        service.setBuyAmount(newAmount);
        expect(service.buyAmount()).toBe(newAmount);
        expect(optionsServiceSpy.setGameItem).toHaveBeenCalledWith('buyAmount', String(newAmount));
      });

      it('setSortOrder should update signal and call saveToStorage', () => {
        const newOrder: SortOrder = 'name';
        service.setSortOrder(newOrder);
        expect(service.sortOrder()).toBe(newOrder);
        expect(optionsServiceSpy.setGameItem).toHaveBeenCalledWith('shopSortOrder', newOrder);
      });

      it('setFilter should update signal and call saveToStorage', () => {
        const newFilter: FilterType = 'affordable';
        service.setFilter(newFilter);
        expect(service.filter()).toBe(newFilter);
        expect(optionsServiceSpy.setGameItem).toHaveBeenCalledWith('shopFilter', newFilter);
      });
    });

    // Pruebas del método 'cycleBuyAmount'
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

    // Pruebas del método 'reset'
    describe('reset', () => {
      it('should reset all signals to their default values', () => {
        service.setBuyAmount(25);
        service.setSortOrder('name');
        service.setFilter('affordable');

        service.reset();

        expect(service.buyAmount()).toBe(1);
        expect(service.sortOrder()).toBe('default');
        expect(service.filter()).toBe('all');
      });
    });
  });

  
  // --- Pruebas que requieren sobrescribir el provider (simular storage) ---
  describe('loadFromStorage on initialization', () => {

    it('should load stored values from storage on construction', () => {
      // Configurar un mock específico para este test
      const storedOptionsSpy = jasmine.createSpyObj('OptionsService', ['getGameItem', 'setGameItem']);
      
      // Simular valores válidos en el storage
      storedOptionsSpy.getGameItem.and.callFake((key: string) => {
        if (key === 'buyAmount') return '10';
        if (key === 'shopSortOrder') return 'price-asc';
        if (key === 'shopFilter') return 'affordable';
        return null;
      });

      // 1. Sobrescribir el provider ANTES de inyectar
      TestBed.overrideProvider(OptionsService, { useValue: storedOptionsSpy });

      // 2. Inyectar el servicio. Esto crea una instancia con el provider sobrescrito.
      const serviceWithStorage = TestBed.inject(ShopControlsService);

      expect(serviceWithStorage.buyAmount()).toBe(10);
      expect(serviceWithStorage.sortOrder()).toBe('price-asc');
      expect(serviceWithStorage.filter()).toBe('affordable');
    });

    it('should ignore invalid stored values and use defaults', () => {
        // Configurar un mock con valores inválidos
        const invalidOptionsSpy = jasmine.createSpyObj('OptionsService', ['getGameItem', 'setGameItem']);
        
        invalidOptionsSpy.getGameItem.and.callFake((key: string) => {
          if (key === 'buyAmount') return '99'; // Inválido
          if (key === 'shopSortOrder') return 'wrong-sort'; // Inválido
          if (key === 'shopFilter') return 'expensive'; // Inválido
          return null;
        });
  
        // 1. Sobrescribir el provider
        TestBed.overrideProvider(OptionsService, { useValue: invalidOptionsSpy });
  
        // 2. Inyectar el servicio
        const invalidService = TestBed.inject(ShopControlsService);
  
        // Debe mantener los valores por defecto
        expect(invalidService.buyAmount()).toBe(1); 
        expect(invalidService.sortOrder()).toBe('default');
        expect(invalidService.filter()).toBe('all');
    });
  });
});