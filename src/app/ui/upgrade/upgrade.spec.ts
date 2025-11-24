import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Upgrade } from './upgrade';
import { UpgradeModel } from '@models/upgrade.model';
import { of } from 'rxjs';
import { PlayerStats } from '@services/player-stats.service';
import { PointsService } from '@services/points.service';
import { AudioService } from '@services/audio.service';
import { OptionsService } from '@services/options.service';

// SIMULACIÓN DE SERVICIOS (MOCKS)
// mocks para cada servicio inyectado en Upgrade

const mockPlayerStats = jasmine.createSpyObj('PlayerStats', [
  'level$',
  'addExp',
  'upgradeExpPerClick',
]);
mockPlayerStats.level$ = of(0);

const mockPointsService = jasmine.createSpyObj('PointsService', [
  'points',
  'substractPoints',
  'pointsPerClick',
  'upgradePointPerClick',
]);
// Simula que points() devuelve un objeto que responde a gte() y lt()
// gte() suficientes puntos para comprar
// lt() insuficientes puntos
mockPointsService.points.and.returnValue({ gte: () => true, lt: () => false } as any);
// Simula pointsPerClick()
mockPointsService.pointsPerClick.and.returnValue({ plus: () => ({}) } as any);

const mockAudioService = jasmine.createSpyObj('AudioService', ['playSfx']);
const mockOptionsService = jasmine.createSpyObj('OptionsService', ['getGameItem', 'setGameItem']);
// Simula que loadFromStorage no encuentra nada por defecto
mockOptionsService.getGameItem.and.returnValue(null);

// Mock de configuración mínima requerida por el componente
const mockConfig: UpgradeModel = {
  id: 1,
  level: 0,
  price: 100,
  clicks: 1,
  exp: 10,
  name: 'Mock Upgrade',
  image: 'mock.png',
};

describe('Upgrade', () => {
  let component: Upgrade;
  let fixture: ComponentFixture<Upgrade>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Upgrade],
      providers: [
        // Provee los mocks para las dependencias
        { provide: PlayerStats, useValue: mockPlayerStats },
        { provide: PointsService, useValue: mockPointsService },
        { provide: AudioService, useValue: mockAudioService },
        { provide: OptionsService, useValue: mockOptionsService },
      ],
    }).compileComponents();
  });

  it('should create and initialize inputs', () => {
    fixture = TestBed.createComponent(Upgrade);
    component = fixture.componentInstance;

    // Establece el Input config ANTES de la detección de cambios inicial
    component.config = mockConfig;

    // Detiene cambios para disparar ngOnInit y los effects
    fixture.detectChanges();

    // Verifica que el componente se haya creado
    expect(component).toBeTruthy();

    // Verifica que la inicialización de estado funcione correctamente
    // El nivel de mockPlayerStats es 0 y mockConfig level es 0, por lo tanto unlocked tiene que ser true
    expect(component.unlocked).toBeTrue();
    // Por defecto bought debe ser false (ya que mockOptionsService devuelve null)
    expect(component.bought).toBeFalse();
  });
});
