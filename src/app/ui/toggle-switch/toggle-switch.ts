import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-toggle-switch',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './toggle-switch.html',
  styleUrl: './toggle-switch.css'
})
export class ToggleSwitch {
  @Input() label: string = '';
  @Input() checked: boolean = false;
  @Output() checkedChange = new EventEmitter<boolean>();

  onCheckedChange(newValue: boolean) {
    this.checked = newValue;
    this.checkedChange.emit(newValue);
  }
}
