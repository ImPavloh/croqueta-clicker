import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkinCard } from './skin-card';

describe('SkinCard', () => {
  let component: SkinCard;
  let fixture: ComponentFixture<SkinCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkinCard],
    }).compileComponents();

    fixture = TestBed.createComponent(SkinCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
