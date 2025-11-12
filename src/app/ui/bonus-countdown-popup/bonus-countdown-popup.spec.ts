import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BonusCountdownPopup } from './bonus-countdown-popup';

describe('BonusCountdownPopup', () => {
  let component: BonusCountdownPopup;
  let fixture: ComponentFixture<BonusCountdownPopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BonusCountdownPopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BonusCountdownPopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
