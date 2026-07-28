import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import Decimal from 'break_infinity.js';
import { getTestProviders } from '@testing/test-helpers';
import { GameBridgeService } from './game-bridge.service';

describe('GameBridgeService', () => {
  it('formats values beyond the native JavaScript number range without Infinity', () => {
    TestBed.configureTestingModule({
      providers: [...getTestProviders(), GameBridgeService],
    });

    const service = TestBed.inject(GameBridgeService);
    service.updatePoints(new Decimal('1e400'));
    service.forceUiUpdate();

    expect(service.displayPoints()).not.toContain('Infinity');
    expect(service.displayPoints()).toContain('Vg');
    expect(service.getRawPoints().eq('1e400')).toBe(true);
  });
});
