import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShopControls } from './shop-controls';

describe('ShopControls', () => {
  let component: ShopControls;
  let fixture: ComponentFixture<ShopControls>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShopControls],
    }).compileComponents();

    fixture = TestBed.createComponent(ShopControls);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('contains view toggle buttons', () => {
    const el: HTMLElement = fixture.nativeElement;
    const buttons = el.querySelectorAll('app-button[variant="control"]');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
