import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GoldenCroqueta } from './golden-croqueta';

describe('GoldenCroqueta', () => {
  let component: GoldenCroqueta;
  let fixture: ComponentFixture<GoldenCroqueta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoldenCroqueta],
    }).compileComponents();

    fixture = TestBed.createComponent(GoldenCroqueta);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
