import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Skins } from './skins';

describe('Skins', () => {
  let component: Skins;
  let fixture: ComponentFixture<Skins>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Skins]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Skins);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
