import { TestBed } from '@angular/core/testing';
import { provideTransloco } from '@jsverse/transloco';
import { provideHttpClientTesting } from '@angular/common/http/testing';

export function configureTransloco(components: any[] = [], imports: any[] = []) {
  TestBed.configureTestingModule({
    imports: [
      ...components,       // TODOS los componentes standalone
      ...imports,          // otros módulos necesarios
    ],
    providers: [
      provideHttpClientTesting(),
      provideTransloco({
      config: {
        availableLangs: ['en', 'es'],
        defaultLang: 'es',
        reRenderOnLangChange: true,
      }
    }),
    ],
  });
}
