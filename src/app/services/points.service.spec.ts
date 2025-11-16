// Archivo: points.service.spec.ts
// Tests para PointsService

import { TestBed, fakeAsync, tick, discardPeriodicTasks } from '@angular/core/testing';
import { PointsService } from './points.service';
import { GoldenCroquetaService } from './golden-croqueta.service';
import { FloatingService } from './floating.service';
import { OptionsService } from './options.service';
import Decimal from 'break_infinity.js';

// --- Mocks de Servicios ---

// Mock para GoldenCroquetaService
class MockGoldenCroquetaService {
  isBonusActive = jasmine.createSpy('isBonusActive').and.returnValue(false);
  bonusMultiplier: Decimal = new Decimal(1);
}

// Mock para FloatingService
const mockFloatingService = jasmine.createSpyObj('FloatingService', ['show']);

// Mock para OptionsService
const mockOptionsService = jasmine.createSpyObj('OptionsService', ['getGameItem', 'setGameItem']);

// --- Suite de Pruebas ---

describe('PointsService', () => {
  let service: PointsService;
  let mockGoldenCroqueta: MockGoldenCroquetaService;

  beforeEach(() => {
    mockGoldenCroqueta = new MockGoldenCroquetaService();
    mockFloatingService.show.calls.reset();
    mockOptionsService.getGameItem.calls.reset();
    mockOptionsService.setGameItem.calls.reset();

    TestBed.configureTestingModule({
      providers: [
        PointsService,
        { provide: GoldenCroquetaService, useValue: mockGoldenCroqueta },
        { provide: FloatingService, useValue: mockFloatingService },
        { provide: OptionsService, useValue: mockOptionsService },
      ],
    });

    mockOptionsService.getGameItem.and.returnValue(undefined);
  });

  // --- Pruebas de Inicialización y Estado por Defecto ---
  describe('Inicialización', () => {
    it('should be created and initialize with default values', fakeAsync(() => {
      service = TestBed.inject(PointsService);
      expect(service.points().eq(0)).toBeTrue();
      expect(service.pointsPerSecond().eq(0)).toBeTrue();
      expect(service.pointsPerClick().eq(1)).toBeTrue();
      expect(service.multiply().eq(1)).toBeTrue();
      discardPeriodicTasks();
    }));
  });

  // --- Pruebas de Carga (loadFromStorage) ---
  describe('Carga desde Storage', () => {
    it('should load values from OptionsService on creation', fakeAsync(() => {
      mockOptionsService.getGameItem.and.callFake((key: string) => {
        switch (key) {
          case 'points': return '1000';
          case 'pointsPerSecond': return '50';
          case 'pointsPerClick': return '5';
          case 'multiply': return '3';
          default: return undefined;
        }
      });
      service = TestBed.inject(PointsService);
      expect(service.points().eq(new Decimal(1000))).toBeTrue();
      expect(service.pointsPerSecond().eq(new Decimal(50))).toBeTrue();
      expect(service.pointsPerClick().eq(new Decimal(5))).toBeTrue();
      expect(service.multiply().eq(new Decimal(3))).toBeTrue();
      discardPeriodicTasks();
    }));
  });

  // --- Pruebas de Funcionalidad Core (Timers Activos) ---
  describe('Funcionalidad Core (Timers Activos)', () => {
    beforeEach(() => {
      // El servicio se inyectará dentro de cada 'it' envuelto en fakeAsync
    });

    it('should add points per click (no bonus) and show floating text', fakeAsync(() => {
      service = TestBed.inject(PointsService);
      tick(2000); // Avanzar para pasar el estado 'isInitializing'
      service.upgradePointPerClick(10);
      mockOptionsService.setGameItem.calls.reset();
      service.addPointsPerClick(100, 200);
      expect(service.points().eq(new Decimal(10))).toBeTrue();
      expect(mockFloatingService.show).toHaveBeenCalledWith('+10', { x: 100, y: 200 });
      expect(mockOptionsService.setGameItem).toHaveBeenCalled();
      discardPeriodicTasks();
    }));

    it('should add points per click (with golden croqueta bonus)', fakeAsync(() => {
      service = TestBed.inject(PointsService);
      tick(2000);
      service.upgradePointPerClick(10);
      mockGoldenCroqueta.isBonusActive.and.returnValue(true);
      mockGoldenCroqueta.bonusMultiplier = new Decimal(5);
      service.addPointsPerClick();
      expect(service.points().eq(new Decimal(50))).toBeTrue();
      expect(mockFloatingService.show).toHaveBeenCalledWith('+50', { x: undefined, y: undefined });
      discardPeriodicTasks();
    }));

    it('should emit click event on addPointsPerClick', fakeAsync(() => {
      service = TestBed.inject(PointsService);
      tick(2000);
      service.upgradePointPerClick(5);
      const expectedAmount = new Decimal(5);
      let receivedAmount: Decimal | undefined;
      const sub = service.onManualClick$.subscribe((amount) => {
        receivedAmount = amount;
      });
      service.addPointsPerClick();
      expect(receivedAmount).toBeDefined();
      expect(receivedAmount?.eq(expectedAmount)).toBeTrue();
      sub.unsubscribe();
      discardPeriodicTasks();
    }));

    it('should add points per second (no bonus) via interval', fakeAsync(() => {
      service = TestBed.inject(PointsService);
      tick(2000);
      service.upgradePointsPerSecond(25);
      tick(1000);
      expect(service.points().eq(new Decimal(25))).toBeTrue();
      expect(mockFloatingService.show).toHaveBeenCalledWith('+25');
      tick(1000);
      expect(service.points().eq(new Decimal(50))).toBeTrue();
      discardPeriodicTasks();
    }));

    it('should add points per second (with bonus) via interval', fakeAsync(() => {
      service = TestBed.inject(PointsService);
      tick(2000);
      service.upgradePointsPerSecond(25);
      mockGoldenCroqueta.isBonusActive.and.returnValue(true);
      mockGoldenCroqueta.bonusMultiplier = new Decimal(2);
      tick(1000);
      expect(service.points().eq(new Decimal(50))).toBeTrue();
      expect(mockFloatingService.show).toHaveBeenCalledWith('+50');
      discardPeriodicTasks();
    }));

    it('should NOT save to storage during initialization (first 2 seconds)', fakeAsync(() => {
      service = TestBed.inject(PointsService);
      service.addPointsPerClick();
      service.upgradePointPerClick(5);
      service.upgradePointsPerSecond(10);
      service.substractPoints(1);
      expect(mockOptionsService.setGameItem).not.toHaveBeenCalled();
      discardPeriodicTasks();
    }));

    it('should save to storage AFTER initialization (after 2 seconds)', fakeAsync(() => {
      service = TestBed.inject(PointsService);
      tick(2000);
      mockOptionsService.setGameItem.calls.reset();
      service.addPointsPerClick();
      expect(mockOptionsService.setGameItem).toHaveBeenCalled();
      discardPeriodicTasks();
    }));

    it('should upgrade points per second and save', fakeAsync(() => {
      service = TestBed.inject(PointsService);
      tick(2000); // Permitir guardado

      // Usar el NÚMERO 456.7 (en lugar del string '456.7') 
      // simula el error de precisión de punto flotante.
      service.upgradePointsPerSecond(456.7); 
      
      // La aserción 'eq' de la librería Decimal debería manejar la precisión
      expect(service.pointsPerSecond().eq(new Decimal('456.7'))).toBeTrue(); 
      
      // El test debe esperar el string impreciso que 'break_infinity.js' 
      // genera cuando se le pasa un 'number' en lugar de un 'string'.
      expect(mockOptionsService.setGameItem).toHaveBeenCalledWith('pointsPerSecond', '456.70000000000005');

      discardPeriodicTasks();
    }));

    it('should subtract points and save', fakeAsync(() => {
      service = TestBed.inject(PointsService);
      tick(2000);
      service.upgradePointPerClick(100);
      service.addPointsPerClick();
      expect(service.points().eq(100)).toBeTrue();
      mockOptionsService.setGameItem.calls.reset();
      service.substractPoints(30);
      expect(service.points().eq(new Decimal(70))).toBeTrue();
      expect(mockOptionsService.setGameItem).toHaveBeenCalledWith('points', '70');
      discardPeriodicTasks();
    }));

    it('should reset all values', fakeAsync(() => {
      service = TestBed.inject(PointsService);
      tick(2000);
      service.upgradePointPerClick(10);
      service.upgradePointsPerSecond(20);
      service.addPointsPerClick();
      expect(service.points().eq(10)).toBeTrue();
      service.reset();
      expect(service.points().eq(0)).toBeTrue();
      expect(service.pointsPerSecond().eq(0)).toBeTrue();
      expect(service.pointsPerClick().eq(1)).toBeTrue();
      expect(service.multiply().eq(1)).toBeTrue();
      discardPeriodicTasks();
    }));
  });
});