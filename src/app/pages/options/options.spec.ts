import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getTestProviders } from '@testing/test-helpers';
import { Options } from './options';

describe('Options', () => {
  let component: Options;
  let fixture: ComponentFixture<Options>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Options],
      providers: [
        ...getTestProviders(),
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
