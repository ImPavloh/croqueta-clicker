import { describe, it, expect, beforeEach } from 'vitest';
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
    fixture.componentRef.setInput('text', 'Test tooltip');
    fixture.detectChanges();
    component.onMouseEnter();
    expect(component.showTooltip).toBe(true);
  });

  it('should hide tooltip on mouse leave', () => {
    fixture.componentRef.setInput('text', 'Test tooltip');
    fixture.detectChanges();
    component.onMouseEnter();
    component.onMouseLeave();
    expect(component.showTooltip).toBe(false);
  });

  it('should not show tooltip when disabled', () => {
    fixture.componentRef.setInput('text', 'Test tooltip');
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    component.onMouseEnter();
    expect(component.showTooltip).toBe(false);
  });

  it('should not show tooltip when text is empty', () => {
    fixture.componentRef.setInput('text', '');
    fixture.detectChanges();
    component.onMouseEnter();
    expect(component.showTooltip).toBe(false);
  });
});
