import { RangeSliderControlModel, ToggleSwitchControlModel } from "@models/ui-controls.model";

export const VOLUMEN_CONTROL: RangeSliderControlModel[] = [
  {
    controlType: 'range-slider',
    label: 'options.generalVolumeLabel',
    value: 100,
    min: 0,
    max: 100,
    step: 1,
    showValue: true,
    valueUnit: '%'
  },
  {
    controlType: 'range-slider',
    label: 'options.musicVolumeLabel',
    value: 100,
    min: 0,
    max: 100,
    step: 1,
    showValue: true,
    valueUnit: '%'
  },
  {
    controlType: 'range-slider',
    label: 'options.sfxVolumeLabel',
    value: 100,
    min: 0,
    max: 100,
    step: 1,
    showValue: true,
    valueUnit: '%'
  }
];

export const INTERFACE_CONTROL: ToggleSwitchControlModel[] = [
  {
    controlType: 'toggle-switch',
    label: 'options.showMascotLabel',
    checked: true
  },
  {
    controlType: 'toggle-switch',
    label: 'options.showParticlesLabel',
    checked: true
  },
  {
    controlType: 'toggle-switch',
    label: 'options.showFloatingPointsLabel',
    checked: true
  }
];
export const INTERFACE_SHOP: ToggleSwitchControlModel = {
  controlType: 'toggle-switch',
  checked: true
}
