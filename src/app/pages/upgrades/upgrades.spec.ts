import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Upgrades } from './upgrades';

describe('Upgrades', () => {
  let component: Upgrades;
  let fixture: ComponentFixture<Upgrades>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Upgrades],
    }).compileComponents();

    fixture = TestBed.createComponent(Upgrades);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
