import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Producer } from './producer';
import { ProducerModel } from '@models/producer.model';
import { of } from 'rxjs';
import { PlayerStats } from '@services/player-stats.service';
import { PointsService } from '@services/points.service';
import { AudioService } from '@services/audio.service';
import { ShopControlsService } from '@services/shop-controls.service';
import { OptionsService } from '@services/options.service';

// mocks para cada servicio inyectado en Producer
const mockPlayerStats = jasmine.createSpyObj('PlayerStats', [
  'level$',
  'addExp',
  'upgradeExpPerClick',
  'currentExp',
  'expToNext',
]);
mockPlayerStats.level$ = of(0); // Simula el Observable para toSignal
mockPlayerStats.currentExp.and.returnValue(40);
mockPlayerStats.expToNext.and.returnValue(100);

const mockPointsService = jasmine.createSpyObj('PointsService', [
  'points',
  'substractPoints',
  'pointsPerSecond',
  'upgradePointsPerSecond',
  'pointsPerClick',
]);

// simula los métodos que devuelven Signals/Decimal. Usaremos un objeto Decimal simulado.
mockPointsService.points.and.returnValue({ gte: () => true, lt: () => false } as any);

const mockAudioService = jasmine.createSpyObj('AudioService', ['playSfx']);
const mockShopControlsService = jasmine.createSpyObj('ShopControlsService', ['buyAmount']);
mockShopControlsService.buyAmount.and.returnValue(1); // Simula el signal de compra

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

    // Establecer el @Input() config ANTES de la detección de cambios inicial
    component.config = mockConfig;

    // Detener cambios para disparar ngOnInit y los effects (que ahora verifican config)
    fixture.detectChanges();

    // Verificar que el componente se haya creado
    expect(component).toBeTruthy();

    // comprobar que las inicializaciones básicas ocurrieron
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
    const locked =
      el.querySelector('.producer-locked') || el.querySelector('.producer-grid-locked');
    expect(locked).toBeTruthy();

    // debe mostrar el número de nivel requerido
    expect(el.textContent).toContain('5');

    // mostrar barra de progreso y texto con nivel y porcentaje
    const progressFill = el.querySelector('.level-progress-fill') as HTMLElement | null;
    expect(progressFill).toBeTruthy();

    const progressText = el.querySelector('.level-progress-text');
    expect(progressText?.textContent).toContain('0');
  });
});
