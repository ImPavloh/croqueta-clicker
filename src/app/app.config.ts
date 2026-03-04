import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  isDevMode,
} from '@angular/core';
import {
  provideRouter,
  withPreloading,
  PreloadAllModules,
  RouteReuseStrategy,
} from '@angular/router';

import { routes } from './app.routes';
import { RouteReuse } from './config/route-reuse';
import { provideServiceWorker } from '@angular/service-worker';
import { provideHttpClient } from '@angular/common/http';
import { TranslocoHttpLoader } from './transloco-loader';
import {
  provideTransloco,
  TranslocoMissingHandler,
  TranslocoMissingHandlerData,
  TRANSLOCO_MISSING_HANDLER,
} from '@jsverse/transloco';

/**
 * Silencia warnings durante la carga inicial (antes de que el JSON llegue),
 * pero aún registra claves faltantes genuinamente una vez que las traducciones están disponibles
 */
class SmartMissingHandler implements TranslocoMissingHandler {
  private startTime = Date.now();

  handle(key: string, data: TranslocoMissingHandlerData) {
    if (Date.now() - this.startTime > 3000) {
      console.warn(`[Transloco] Missing key: '${key}' [${data.activeLang}]`);
    }
    return key;
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    { provide: RouteReuseStrategy, useClass: RouteReuse },
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerImmediately',
    }),
    provideHttpClient(),
    provideTransloco({
      config: {
        availableLangs: ['en', 'es'],
        defaultLang: 'es',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),
    { provide: TRANSLOCO_MISSING_HANDLER, useClass: SmartMissingHandler },
  ],
};
