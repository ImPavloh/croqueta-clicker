import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getTestProviders } from '@testing/test-helpers';

import { SkinCard } from './skin-card';
import { SkinModel } from '@models/skin.model';

describe('SkinCard', () => {
  let component: SkinCard;
  let fixture: ComponentFixture<SkinCard>;

  const mockSkin: SkinModel = {
    id: 1,
    name: 'Test Skin',
    description: 'A test skin for testing',
    image: '/assets/skins/test.webp',
    rarity: 'common',
    unlocked: true,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkinCard],
      providers: [...getTestProviders()],
    }).compileComponents();

    fixture = TestBed.createComponent(SkinCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('config', mockSkin);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
