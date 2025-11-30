export type ButtonVariant =
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'quaternary'
    | 'danger'
    | 'success'
    | 'warning'
    | 'nav'
    | 'control'
    | 'golden';
/**
 * Define los tipos de controles de UI que podemos representar con nuestro modelo.
 * Usaremos esto como un "discriminante" para saber qué componente renderizar.
 */
export type ControlType = 'input' | 'range-slider' | 'button' | 'toggle-switch';

/**
 * Interfaz base con las propiedades que todos nuestros controles de UI podrían compartir.
 */
export interface BaseControlModel {
  /** El tipo de control, para que Angular sepa qué componente mostrar. */
  controlType: ControlType;
  /** Una etiqueta de texto que se muestra junto al control. */
  label?: string | null;
  /** El valor actual del control. */
  value?: any;
}

/**
 * Modelo para representar un componente de tipo 'input'.
 * Extiende la base y añade sus propiedades específicas.
 */
export interface InputControlModel extends BaseControlModel {
  controlType: 'input'; // Se especializa el tipo para este modelo.
  placeholder?: string | null;
  type?: 'text' | 'number' | 'password';
  /** Restricciones para cuando el tipo es 'number'. */
  min?: number;
  max?: number;
  step?: number;
  /** Texto para el botón que acompaña al input. */
  buttonText?: string | null;
}

/**
 * Modelo para representar un componente de tipo 'range-slider'.
 */
export interface RangeSliderControlModel extends BaseControlModel {
  controlType: 'range-slider'; // Se especializa el tipo.
  value: number; // En un slider, el valor siempre será un número.
  min: number;
  max: number;
  step: number;
  showValue?: boolean;
  valueUnit?: string;
}

/**
 * Modelo para representar un componente de tipo 'button'.
 * Este es más para acciones que para entrada de datos.
 */
export interface ButtonControlModel {
  controlType: 'button';
  text: string;
  variant: ButtonVariant;
  disabled?: boolean;
  // No extiende BaseControlModel porque su propósito es diferente (no tiene 'value').
  // Podríamos añadir un `actionId` para identificar qué hacer al hacer clic.
  actionId?: string;
}
export interface ToggleSwitchControlModel extends BaseControlModel {
  controlType: 'toggle-switch';
  checked: boolean;
}
/**
 * Tipo de unión discriminada. Una variable de este tipo puede ser CUALQUIERA
 * de los modelos de control definidos. Esto es increíblemente potente.
 */
export type UiControlModel = InputControlModel | RangeSliderControlModel | ButtonControlModel | ToggleSwitchControlModel;
