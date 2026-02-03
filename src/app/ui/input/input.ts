import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { ButtonComponent } from '@ui/button/button';

@Component({
  selector: 'app-input',
  imports: [CommonModule, FormsModule, TranslocoModule, ButtonComponent],
  templateUrl: './input.html',
  styleUrls: ['./input.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent {
  value = input<any>('');
  loading = input(false);
  message = input<string | null>(null);
  placeholder = input<string | null>('');
  type = input<'text' | 'number' | 'password'>('text');
  buttonText = input<string | null>(null);
  /** Optional label to render above the control */
  label = input<string | null>(null);
  /** If true, the inline button is hidden and submit only fires on Enter */
  hideButton = input(false);
  /** Numeric input constraints (only applies when type === 'number') */
  min = input<number | undefined>(undefined);
  max = input<number | undefined>(undefined);
  step = input<number | undefined>(undefined);
  loadingText = input<string | null>(null);

  valueChange = output<any>();
  submit = output<void>();

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
