import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AudioService } from '@services/audio.service';

@Component({
  selector: 'app-range-slider',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './range-slider.html',
  styleUrl: './range-slider.css'
})
export class RangeSlider {
  private audioService = inject(AudioService);

  @Input() label: string = '';
  @Input() value: number = 0;
  @Input() min: number = 0;
  @Input() max: number = 100;
  @Input() step: number = 1;
  @Input() showValue: boolean = true;
  @Input() valueUnit: string = '%';
  @Output() valueChange = new EventEmitter<number>();

  onValueChange(newValue: number) {
    this.value = newValue;
    this.valueChange.emit(newValue);
  }

  onSliderRelease() {
    this.audioService.playSfx('/assets/sfx/switch01.mp3', 1);
  }
}
