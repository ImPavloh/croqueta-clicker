import { TestBed } from '@angular/core/testing';

import { PlayerStats } from './player-stats';

describe('PlayerStats', () => {
  let service: PlayerStats;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlayerStats);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
