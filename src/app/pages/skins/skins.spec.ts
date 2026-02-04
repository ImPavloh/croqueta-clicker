import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getTestProviders } from '@testing/test-helpers';

import { Skins } from './skins';

describe('Skins', () => {
  let component: Skins;
  let fixture: ComponentFixture<Skins>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Skins],
      providers: [...getTestProviders()],
    }).compileComponents();

    fixture = TestBed.createComponent(Skins);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
