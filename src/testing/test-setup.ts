import { beforeEach, vi, expect as vitestExpect } from 'vitest';

// Global test setup for Vitest + Angular 21
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

// Configure TestBed to use zoneless change detection
beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection()],
  });
});

// Jasmine compatibility layer for Vitest
// This helps migrate tests incrementally
(globalThis as any).jasmine = {
  createSpyObj: (name: string, methods: string[]) => {
    const obj: Record<string, any> = {};
    methods.forEach((method) => {
      obj[method] = vi.fn();
    });
    return obj;
  },
  createSpy: (name: string) => vi.fn(),
  any: (constructor: any) => vitestExpect.any(constructor),
};

(globalThis as any).spyOn = vi.spyOn;
(globalThis as any).fail = (message: string) => {
  throw new Error(message);
};
