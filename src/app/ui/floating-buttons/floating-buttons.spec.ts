import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FloatingButtons } from './floating-buttons';
import { getTestProviders } from '@testing/test-helpers';

describe('FloatingButtons', () => {
  let component: FloatingButtons;
  let fixture: ComponentFixture<FloatingButtons>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloatingButtons],
      providers: [...getTestProviders()],
    }).compileComponents();

    fixture = TestBed.createComponent(FloatingButtons);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
