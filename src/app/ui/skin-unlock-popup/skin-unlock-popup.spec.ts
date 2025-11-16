import { TestBed } from '@angular/core/testing';
import { SkinUnlockPopup } from './skin-unlock-popup';

describe('SkinUnlockPopup', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkinUnlockPopup],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(SkinUnlockPopup);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
