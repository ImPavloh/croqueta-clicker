import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LevelUpPopup } from './level-up-popup';

describe('LevelUpPopup', () => {
  let component: LevelUpPopup;
  let fixture: ComponentFixture<LevelUpPopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LevelUpPopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LevelUpPopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
