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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
