import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getTestProviders } from '@testing/test-helpers';
import { NewsLine } from './newsline';

describe('Newsline', () => {
  let component: NewsLine;
  let fixture: ComponentFixture<NewsLine>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsLine],
      providers: [...getTestProviders()],
    }).compileComponents();

    fixture = TestBed.createComponent(NewsLine);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
