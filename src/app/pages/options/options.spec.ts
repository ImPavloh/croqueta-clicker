import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTransloco } from '@jsverse/transloco';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Options } from './options';

describe('Options', () => {
  let component: Options;
  let fixture: ComponentFixture<Options>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Options],
      providers: [
        provideHttpClientTesting(),
        provideTransloco({
          config: {
            availableLangs: ['en', 'es'],
            defaultLang: 'es',
          },
        }),
        {
          provide: (await import('@services/debug.service')).DebugService,
          useValue: { isDebugMode: false, isDebugMode$: null, enableDebugMode: () => {} },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Options);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
