import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Producer } from './producer';
import { ProducerModel } from '@models/producer.model'; // Asegúrate de importar el modelo
import { of } from 'rxjs'; // Necesario para simular Observables
import { PlayerStats } from '@services/player-stats.service';
import { PointsService } from '@services/points.service';
import { AudioService } from '@services/audio.service';
import { ShopControlsService } from '@services/shop-controls.service';
import { OptionsService } from '@services/options.service';

// --- SIMULACIÓN DE SERVICIOS (MOCKS) ---
// Define mocks para cada servicio inyectado en Producer.ts
const mockPlayerStats = jasmine.createSpyObj('PlayerStats', [
  'level$',
  'addExp',
  'upgradeExpPerClick',
]);
mockPlayerStats.level$ = of(0); // Simula el Observable para toSignal

const mockPointsService = jasmine.createSpyObj('PointsService', [
  'points',
  'substractPoints',
  'pointsPerSecond',
  'upgradePointsPerSecond',
  'pointsPerClick',
]);
// Simula los métodos que devuelven Signals/Decimal. Usaremos un objeto Decimal simulado.
mockPointsService.points.and.returnValue({ gte: () => true, lt: () => false } as any);

const mockAudioService = jasmine.createSpyObj('AudioService', ['playSfx']);
const mockShopControlsService = jasmine.createSpyObj('ShopControlsService', [
  'buyAmount',
  'gridView',
]);
mockShopControlsService.buyAmount.and.returnValue(1); // Simula el signal de compra
mockShopControlsService.gridView.and.returnValue(false); // Por defecto, vista lista

const mockOptionsService = jasmine.createSpyObj('OptionsService', ['getGameItem', 'setGameItem']);

// Mock de configuración mínima requerida por el componente
const mockConfig: ProducerModel = {
  id: 1,
  level: 0,
  priceBase: 1,
  priceMult: 1.1,
  pointsBase: 0,
  pointsSum: 1,
  exp: 1,
  name: 'Test',
  image: '',
  description: '',
};

// ----------------------------------------

describe('Producer', () => {
  let component: Producer;
  let fixture: ComponentFixture<Producer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Producer], // Componente Standalone
      // Proveer todos los servicios inyectados en el constructor
      providers: [
        { provide: PlayerStats, useValue: mockPlayerStats },
        { provide: PointsService, useValue: mockPointsService },
        { provide: AudioService, useValue: mockAudioService },
        { provide: ShopControlsService, useValue: mockShopControlsService },
        { provide: OptionsService, useValue: mockOptionsService },
      ],
    }).compileComponents();
  });

  it('should create and initialize inputs', () => {
    fixture = TestBed.createComponent(Producer);
    component = fixture.componentInstance;

    // 👈 1. Establecer el @Input() config ANTES de la detección de cambios inicial
    component.config = mockConfig;

    // 👈 2. Detener cambios para disparar ngOnInit y los effects (que ahora verifican 'config')
    fixture.detectChanges();

    // 👈 3. Verificar que el componente se haya creado
    expect(component).toBeTruthy();

    // 👈 OPCIONAL: Verificar que las inicializaciones básicas ocurrieron
    expect(component.unlocked).toBeTrue();
    expect(component.price.toNumber()).toBeGreaterThan(0); // Verificar que calculateBulkPrice se ejecutó
  });

  it('renders locked state with required level when not unlocked', () => {
    fixture = TestBed.createComponent(Producer);
    component = fixture.componentInstance;

    // establecer un nivel requerido mayor al del jugador (mockPlayerStats.level$ es 0)
    component.config = { ...mockConfig, level: 5 } as ProducerModel;

    fixture.detectChanges();

    // componente debe existir y estar bloqueado
    expect(component.unlocked).toBeFalse();

    const el = fixture.nativeElement as HTMLElement;
    const locked = el.querySelector('.producer-locked');
    expect(locked).toBeTruthy();

    // debe mostrar el número de nivel requerido
    expect(el.textContent).toContain('5');
  });
});
