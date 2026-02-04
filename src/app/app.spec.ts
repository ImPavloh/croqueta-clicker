import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { getTestProviders } from '@testing/test-helpers';
import { App } from './app';
import { SwUpdate } from '@angular/service-worker';
import { of } from 'rxjs';

const mockSwUpdate = {
  isEnabled: false,
  versionUpdates: of(),
  checkForUpdate: () => Promise.resolve(false),
  activateUpdate: () => Promise.resolve(false),
};

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [...getTestProviders(), { provide: SwUpdate, useValue: mockSwUpdate }],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
