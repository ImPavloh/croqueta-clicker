import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Producer } from './producer';

describe('Producer', () => {
  let component: Producer;
  let fixture: ComponentFixture<Producer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Producer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Producer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
