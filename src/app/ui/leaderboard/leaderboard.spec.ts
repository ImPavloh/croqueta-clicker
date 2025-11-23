import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Leaderboard } from './leaderboard';
import { of } from 'rxjs';

class MockSupabaseService {
  getClient() {
    return { auth: { onAuthStateChange: () => {} } };
  }

  async getUser() {
    return { data: { user: { id: 'uid-1', user_metadata: {} } } };
  }

  getPendingScores() {
    return [];
  }
}

class MockPointsService {}

class MockModalService {
  openModal = jasmine.createSpy('openModal');
}

class MockPlayerStats {
  level$ = of(0);
}

describe('Leaderboard — username prompt delay', () => {
  let fixture: ComponentFixture<Leaderboard>;
  let component: Leaderboard;
  let modalService: MockModalService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Leaderboard],
      providers: [
        {
          provide: (await import('@services/supabase.service')).SupabaseService,
          useClass: MockSupabaseService,
        },
        {
          provide: (await import('@services/points.service')).PointsService,
          useClass: MockPointsService,
        },
        {
          provide: (await import('@services/modal.service')).ModalService,
          useClass: MockModalService,
        },
        {
          provide: (await import('@services/debug.service')).DebugService,
          useValue: { isDebugMode: false, isDebugMode$: of(false), enableDebugMode: () => {} },
        },
        {
          provide: (await import('@services/player-stats.service')).PlayerStats,
          useClass: MockPlayerStats,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Leaderboard);
    component = fixture.componentInstance;
    modalService = TestBed.inject(
      (await import('@services/modal.service')).ModalService
    ) as unknown as MockModalService;
  });

  it('does not open username modal immediately, opens after ~5s', fakeAsync(() => {
    fixture.detectChanges();

    tick(0);

    expect(modalService.openModal).not.toHaveBeenCalled();

    tick(5000);
    expect(modalService.openModal).toHaveBeenCalledWith('username');
  }));
});
