import { TestBed, TestBedStatic } from '@angular/core/testing';
import { provideTransloco } from '@jsverse/transloco';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {
  provideZonelessChangeDetection,
  Type,
  Provider,
  EnvironmentProviders,
} from '@angular/core';
import { provideRouter } from '@angular/router';

export function getTestProviders(): Array<Provider | EnvironmentProviders> {
  return [
    provideZonelessChangeDetection(),
    provideHttpClient(),
    provideHttpClientTesting(),
    provideRouter([]),
    provideTransloco({
      config: {
        availableLangs: ['en', 'es'],
        defaultLang: 'es',
        fallbackLang: 'en',
        reRenderOnLangChange: true,
      },
    }),
  ];
}

export async function configureTestBed(
  component: Type<any>,
  additionalProviders: Array<Provider | EnvironmentProviders> = [],
  additionalImports: any[] = [],
): Promise<TestBedStatic> {
  await TestBed.configureTestingModule({
    imports: [component, ...additionalImports],
    providers: [...getTestProviders(), ...additionalProviders],
  }).compileComponents();

  return TestBed;
}
