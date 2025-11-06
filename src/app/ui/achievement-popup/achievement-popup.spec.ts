import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AchievementPopup } from './achievement-popup';

describe('AchievementPopup', () => {
  let component: AchievementPopup;
  let fixture: ComponentFixture<AchievementPopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AchievementPopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AchievementPopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
