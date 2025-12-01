import { TestBed } from '@angular/core/testing';
import { News } from './news';
import { configureTransloco } from 'testing/test-helpers';

describe('News', () => {
  beforeEach(async () => {
    configureTransloco([News]);
    await TestBed.compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(News);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
