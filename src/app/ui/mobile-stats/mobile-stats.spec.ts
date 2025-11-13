import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileStats } from './mobile-stats';

describe('MobileStats', () => {
  let component: MobileStats;
  let fixture: ComponentFixture<MobileStats>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileStats]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MobileStats);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
