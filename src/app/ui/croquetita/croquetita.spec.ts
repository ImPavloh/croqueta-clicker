import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Croquetita } from './croquetita';

describe('Croquetita', () => {
  let component: Croquetita;
  let fixture: ComponentFixture<Croquetita>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Croquetita],
    }).compileComponents();

    fixture = TestBed.createComponent(Croquetita);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle dialog on click', () => {
    expect(component.isOpen()).toBe(false);
    component.toggleHelper();
    expect(component.isOpen()).toBe(true);
    component.toggleHelper();
    expect(component.isOpen()).toBe(false);
  });
});
