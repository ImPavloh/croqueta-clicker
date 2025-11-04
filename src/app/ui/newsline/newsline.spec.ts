import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Newsline } from './newsline';

describe('Newsline', () => {
  let component: Newsline;
  let fixture: ComponentFixture<Newsline>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Newsline]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Newsline);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
