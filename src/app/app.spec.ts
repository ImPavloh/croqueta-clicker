import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { configureTransloco } from 'testing/test-helpers';
import { SwUpdate } from '@angular/service-worker';
import { of } from 'rxjs';

// Mock simple para el Service Worker Update
const mockSwUpdate = {
  isEnabled: false,
  versionUpdates: of(), // Observable vacío
  checkForUpdate: () => Promise.resolve(false),
  activateUpdate: () => Promise.resolve(false)
};

beforeEach(async () => {
  configureTransloco([App]);
  await TestBed.compileComponents();
});

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: SwUpdate, useValue: mockSwUpdate }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
