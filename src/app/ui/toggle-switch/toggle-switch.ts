import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AudioService } from '@services/audio.service';

@Component({
  selector: 'app-toggle-switch',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './toggle-switch.html',
  styleUrl: './toggle-switch.css'
})
export class ToggleSwitch {
  private audioService = inject(AudioService);

  @Input() label: string = '';
  @Input() checked: boolean = false;
  @Output() checkedChange = new EventEmitter<boolean>();

  onCheckedChange(newValue: boolean) {
    this.checked = newValue;
    this.checkedChange.emit(newValue);
    this.audioService.playSfx('/assets/sfx/switch01.mp3', 1);
  }
}
