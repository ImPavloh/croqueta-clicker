import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getTestProviders } from '@testing/test-helpers';

import { DynamicControls } from './dynamic-controls';
import { RangeSliderControlModel } from '@models/ui-controls.model';

describe('DynamicControls', () => {
  let component: DynamicControls;
  let fixture: ComponentFixture<DynamicControls>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicControls],
      providers: [...getTestProviders()],
    }).compileComponents();

    fixture = TestBed.createComponent(DynamicControls);
    component = fixture.componentInstance;

    // Asigna un control mock antes de la detección de cambios usando setInput para signals
    const mockControl: RangeSliderControlModel = {
      controlType: 'range-slider',
      value: 50,
      min: 0,
      max: 100,
      step: 1,
      label: 'test',
    };
    fixture.componentRef.setInput('control', mockControl);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
