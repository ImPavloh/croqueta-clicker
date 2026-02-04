import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getTestProviders } from '@testing/test-helpers';

import { TutorialOverlayComponent } from './tutorial-overlay';

describe('TutorialOverlayComponent', () => {
  let component: TutorialOverlayComponent;
  let fixture: ComponentFixture<TutorialOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TutorialOverlayComponent],
      providers: [...getTestProviders()],
    }).compileComponents();

    fixture = TestBed.createComponent(TutorialOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
