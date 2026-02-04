import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getTestProviders } from '@testing/test-helpers';
import { Achievements } from './achievements';

describe('Achivements', () => {
  let component: Achievements;
  let fixture: ComponentFixture<Achievements>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Achievements],
      providers: [...getTestProviders()],
    }).compileComponents();

    fixture = TestBed.createComponent(Achievements);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
