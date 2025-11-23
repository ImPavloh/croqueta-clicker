import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { ButtonComponent } from '@ui/button/button';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslocoModule, ButtonComponent],
  templateUrl: './input.html',
  styleUrls: ['./input.css'],
})
export class InputComponent {
  @Input() value: any = '';
  @Input() loading = false;
  @Input() message?: string | null = null;
  @Input() placeholder?: string | null = '';
  @Input() type: 'text' | 'number' | 'password' = 'text';
  @Input() buttonText?: string | null = null;
  /** Optional label to render above the control */
  @Input() label?: string | null = null;
  /** If true, the inline button is hidden and submit only fires on Enter */
  @Input() hideButton: boolean = false;
  /** Numeric input constraints (only applies when type === 'number') */
  @Input() min?: number;
  @Input() max?: number;
  @Input() step?: number;
  @Input() loadingText?: string | null = null;

  @Output() valueChange = new EventEmitter<any>();
  @Output() submit = new EventEmitter<void>();

  onKeydownEnter() {
    this.submit.emit();
  }

  onChange(v: any) {
    this.valueChange.emit(v);
  }

  onSubmit() {
    this.submit.emit();
  }
}
