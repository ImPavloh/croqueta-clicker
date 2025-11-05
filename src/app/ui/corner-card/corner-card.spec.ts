import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CornerCard } from './corner-card';

describe('CornerCard', () => {
  let component: CornerCard;
  let fixture: ComponentFixture<CornerCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CornerCard],
    }).compileComponents();

    fixture = TestBed.createComponent(CornerCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
