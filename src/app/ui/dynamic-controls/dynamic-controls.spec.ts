import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicControls } from './dynamic-controls';

describe('DynamicControls', () => {
  let component: DynamicControls;
  let fixture: ComponentFixture<DynamicControls>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicControls]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DynamicControls);
    component = fixture.componentInstance;
    
    // Asigna un control mock antes de la detección de cambios
    component.control = {
      controlType: 'range-slider',
      value: 50,
      min: 0,
      max: 100,
      step: 1,
      label: 'test'
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
