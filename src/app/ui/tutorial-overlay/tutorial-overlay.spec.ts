import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TutorialOverlayComponent } from './tutorial-overlay';

describe('TutorialOverlayComponent', () => {
  let component: TutorialOverlayComponent;
  let fixture: ComponentFixture<TutorialOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TutorialOverlayComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TutorialOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
