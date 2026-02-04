import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getTestProviders } from '@testing/test-helpers';

import { Clicker } from './clicker';

describe('Clicker', () => {
  let component: Clicker;
  let fixture: ComponentFixture<Clicker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Clicker],
      providers: [...getTestProviders()],
    }).compileComponents();

    fixture = TestBed.createComponent(Clicker);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
