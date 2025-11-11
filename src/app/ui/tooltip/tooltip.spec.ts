import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tooltip } from './tooltip';

describe('Tooltip', () => {
  let component: Tooltip;
  let fixture: ComponentFixture<Tooltip>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tooltip],
    }).compileComponents();

    fixture = TestBed.createComponent(Tooltip);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show tooltip on mouse enter', () => {
    component.text = 'Test tooltip';
    component.onMouseEnter();
    expect(component.showTooltip).toBe(true);
  });

  it('should hide tooltip on mouse leave', () => {
    component.text = 'Test tooltip';
    component.onMouseEnter();
    component.onMouseLeave();
    expect(component.showTooltip).toBe(false);
  });

  it('should not show tooltip when disabled', () => {
    component.text = 'Test tooltip';
    component.disabled = true;
    component.onMouseEnter();
    expect(component.showTooltip).toBe(false);
  });

  it('should not show tooltip when text is empty', () => {
    component.text = '';
    component.onMouseEnter();
    expect(component.showTooltip).toBe(false);
  });
});
