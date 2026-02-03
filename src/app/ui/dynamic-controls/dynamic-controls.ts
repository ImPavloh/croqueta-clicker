import { Component, input, output, inject, ChangeDetectionStrategy } from '@angular/core';
import {
  RangeSliderControlModel,
  ToggleSwitchControlModel,
  UiControlModel,
} from '@models/ui-controls.model';
import { AudioService } from '@services/audio.service';
import { TranslocoModule } from '@jsverse/transloco';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dynamic-controls',
  imports: [TranslocoModule, FormsModule],
  templateUrl: './dynamic-controls.html',
  styleUrls: ['./range-slider.css', './toggle-switch.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicControls {
  private audioService = inject(AudioService);

  control = input.required<UiControlModel>();
  valueChange = output<any>();

  getRangeControl(): RangeSliderControlModel {
    return this.control() as RangeSliderControlModel;
  }

  getToggleControl(): ToggleSwitchControlModel {
    return this.control() as ToggleSwitchControlModel;
  }

  onValueChange(event: Event) {
    // Extraer el valor del evento si es necesario
    const target = event.target as HTMLInputElement;
    const value = Number(target.value);
    const ctrl = this.control() as RangeSliderControlModel;
    if (ctrl.controlType === 'range-slider') {
      ctrl.value = value;
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
