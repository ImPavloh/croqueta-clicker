import { beforeEach, vi, expect as vitestExpect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideTransloco } from '@jsverse/transloco';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [
      provideZonelessChangeDetection(),
      provideHttpClient(),
      provideHttpClientTesting(),
      provideTransloco({
        config: {
          availableLangs: ['en', 'es'],
          defaultLang: 'es',
          fallbackLang: 'en',
          reRenderOnLangChange: true,
        },
      }),
    ],
  });
});

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
