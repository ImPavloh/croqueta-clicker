import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BurntCroqueta } from './burnt-croqueta';

describe('BurntCroqueta', () => {
  let component: BurntCroqueta;
  let fixture: ComponentFixture<BurntCroqueta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BurntCroqueta],
    }).compileComponents();

    fixture = TestBed.createComponent(BurntCroqueta);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
