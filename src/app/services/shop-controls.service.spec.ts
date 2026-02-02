import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ShopControlsService, BuyAmount, SortOrder, FilterType } from './shop-controls.service';
import { OptionsService } from './options.service';

describe('ShopControlsService', () => {
  let service: ShopControlsService;
  let optionsServiceMock: {
    getGameItem: ReturnType<typeof vi.fn>;
    setGameItem: ReturnType<typeof vi.fn>;
  };

  // Configuración base antes de cada test
  beforeEach(() => {
    optionsServiceMock = {
      getGameItem: vi.fn(),
      setGameItem: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [ShopControlsService, { provide: OptionsService, useValue: optionsServiceMock }],
    });
  });

  // Pruebas con la configuración por defecto (storage vacío)
  describe('with default (empty) storage', () => {
    beforeEach(() => {
      service = TestBed.inject(ShopControlsService);
    });

    it('should be created with default values if storage is empty', () => {
      // verificar que el servicio se creó
      expect(service).toBeTruthy();

      // verificar que los spies fueron llamados por el constructor
      expect(optionsServiceMock.getGameItem).toHaveBeenCalledWith('buyAmount');

      // verificar los valores por defecto
      expect(service.buyAmount()).toBe(1);
    });

    // Pruebas de los métodos set
    describe('State Setters', () => {
      it('setBuyAmount should update signal and call saveToStorage', () => {
        const newAmount: BuyAmount = 25;
        service.setBuyAmount(newAmount);
        expect(service.buyAmount()).toBe(newAmount);
        expect(optionsServiceMock.setGameItem).toHaveBeenCalledWith('buyAmount', String(newAmount));
      });
    });

    // Pruebas del método cycleBuyAmount
    describe('cycleBuyAmount', () => {
      it('should cycle 1 -> 10', () => {
        service.setBuyAmount(1);
        optionsServiceMock.setGameItem.mockClear();
        service.cycleBuyAmount();
        expect(service.buyAmount()).toBe(10);
        expect(optionsServiceMock.setGameItem).toHaveBeenCalledWith('buyAmount', '10');
      });

      it('should cycle 10 -> 25', () => {
        service.setBuyAmount(10);
        optionsServiceMock.setGameItem.mockClear();
        service.cycleBuyAmount();
        expect(service.buyAmount()).toBe(25);
        expect(optionsServiceMock.setGameItem).toHaveBeenCalledWith('buyAmount', '25');
      });

      it('should cycle 25 -> 1', () => {
        service.setBuyAmount(25);
        optionsServiceMock.setGameItem.mockClear();
        service.cycleBuyAmount();
        expect(service.buyAmount()).toBe(1);
        expect(optionsServiceMock.setGameItem).toHaveBeenCalledWith('buyAmount', '1');
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
      const storedOptionsMock = {
        getGameItem: vi.fn(),
        setGameItem: vi.fn(),
      };

      // Simular valores válidos en el storage
      storedOptionsMock.getGameItem.mockImplementation((key: string) => {
        if (key === 'buyAmount') return '10';
        return null;
      });

      // Sobrescribir el provider antes de inyectar
      TestBed.overrideProvider(OptionsService, { useValue: storedOptionsMock });

      // Inyectar el servicio
      const serviceWithStorage = TestBed.inject(ShopControlsService);

      expect(serviceWithStorage.buyAmount()).toBe(10);
    });

    it('should ignore invalid stored values and use defaults', () => {
      const invalidOptionsMock = {
        getGameItem: vi.fn(),
        setGameItem: vi.fn(),
      };

      invalidOptionsMock.getGameItem.mockImplementation((key: string) => {
        if (key === 'buyAmount') return '99'; // Inválido
        return null;
      });

      TestBed.overrideProvider(OptionsService, { useValue: invalidOptionsMock });
      const invalidService = TestBed.inject(ShopControlsService);
      expect(invalidService.buyAmount()).toBe(1);
    });
  });
});
