import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { RangeSliderControlModel, ToggleSwitchControlModel, UiControlModel } from '@models/ui-controls.model';
import { AudioService } from '@services/audio.service';
import { TranslocoModule } from '@jsverse/transloco';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dynamic-controls',
  imports: [TranslocoModule, FormsModule],
  templateUrl: './dynamic-controls.html',
  styleUrls: ['./range-slider.css', './toggle-switch.css']
})
export class DynamicControls {
  private audioService = inject(AudioService);

  @Input() control!: UiControlModel;
  @Output() valueChange = new EventEmitter<any>();

  onValueChange(event: Event) {
    // Extraer el valor del evento si es necesario
    const target = event.target as HTMLInputElement;
    const value = Number(target.value);
    if (this.control.controlType === 'range-slider') {
      (this.control as RangeSliderControlModel).value = value;
    }
    this.valueChange.emit(value);
    this.audioService.playSfx('/assets/sfx/switch01.mp3', 1);
  }

  onToggleChange(newValue: boolean) {
    const checked = newValue;
    this.valueChange.emit(checked);
    this.audioService.playSfx('/assets/sfx/switch01.mp3', 1);
  }

}
