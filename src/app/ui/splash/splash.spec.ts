import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Splash } from './splash';
import { getTestProviders } from '@testing/test-helpers';

describe('Splash', () => {
  let component: Splash;
  let fixture: ComponentFixture<Splash>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Splash],
      providers: [...getTestProviders()],
    }).compileComponents();

    fixture = TestBed.createComponent(Splash);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
