import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Upgrade } from './upgrade';

describe('Upgrade', () => {
  let component: Upgrade;
  let fixture: ComponentFixture<Upgrade>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Upgrade]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Upgrade);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
