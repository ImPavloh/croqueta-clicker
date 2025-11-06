import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AchievementList } from './achievement-list';

describe('AchievementList', () => {
  let component: AchievementList;
  let fixture: ComponentFixture<AchievementList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AchievementList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AchievementList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
