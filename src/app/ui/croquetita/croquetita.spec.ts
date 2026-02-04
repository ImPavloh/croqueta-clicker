import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getTestProviders } from '@testing/test-helpers';
import { Croquetita } from './croquetita';

describe('Croquetita', () => {
  let component: Croquetita;
  let fixture: ComponentFixture<Croquetita>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Croquetita],
      providers: [...getTestProviders()],
    }).compileComponents();

    fixture = TestBed.createComponent(Croquetita);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
