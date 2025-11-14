import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewsLine } from './newsline';



describe('Newsline', () => {
  let component: NewsLine;
  let fixture: ComponentFixture<NewsLine>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsLine]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewsLine);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
