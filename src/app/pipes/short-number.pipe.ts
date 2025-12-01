import { Pipe, PipeTransform } from '@angular/core';
import Decimal from 'break_infinity.js';

/**
 * Pipe para formatear números grandes en notación abreviada.
 * Convierte números como 1000000 a "1M", 1000000000 a "1B", etc.
 * Soporta números muy grandes usando la librería break_infinity.js.
 */
@Pipe({
  name: 'short',
  standalone: true,
})
export class ShortNumberPipe implements PipeTransform {
  /**
   * Transforma un número en su representación abreviada.
   * @param value Número a formatear (Decimal, number, string o null/undefined)
   * @param maxDecimals Número máximo de decimales a mostrar (por defecto 2)
   * @returns String con el número formateado
   */
  transform(value: Decimal | number | string | null | undefined, maxDecimals = 2): string {
    if (value == null) return '0';

    // Convertir a Decimal de forma segura
    let num: Decimal;
    try {
      num = value instanceof Decimal ? value : new Decimal(value);
    } catch {
      return String(value);
    }

    const sign = num.lt(0) ? '-' : '';
    const abs = num.abs();

    // Escalas con sufijos
    const units: { value: Decimal; symbol: string }[] = [
      { value: new Decimal(1e63), symbol: 'Vg' }, // vigintillón
      { value: new Decimal(1e60), symbol: 'Nv' }, // novendecillón
      { value: new Decimal(1e57), symbol: 'Od' }, // octodecillón
      { value: new Decimal(1e54), symbol: 'Sd' }, // septendecillón
      { value: new Decimal(1e51), symbol: 'Sxd' }, // sexdecillón
      { value: new Decimal(1e48), symbol: 'Qnd' }, // quindecillón
      { value: new Decimal(1e45), symbol: 'Qtd' }, // cuatordecillón
      { value: new Decimal(1e42), symbol: 'Trd' }, // tredecillón
      { value: new Decimal(1e39), symbol: 'Dod' }, // duodecillón
      { value: new Decimal(1e36), symbol: 'Und' }, // undecillón
      { value: new Decimal(1e33), symbol: 'Dc' }, // decillón
      { value: new Decimal(1e30), symbol: 'No' }, // nonillón
      { value: new Decimal(1e27), symbol: 'Oc' }, // octillón
      { value: new Decimal(1e24), symbol: 'Sp' }, // septillón
      { value: new Decimal(1e21), symbol: 'Sx' }, // sextillón
      { value: new Decimal(1e18), symbol: 'Qi' }, // quintillón
      { value: new Decimal(1e15), symbol: 'Qa' }, // cuatrillón
      { value: new Decimal(1e12), symbol: 'T' }, // trillón
      { value: new Decimal(1e9), symbol: 'B' }, // mil millones (billón)
      { value: new Decimal(1e6), symbol: 'M' }, // millón
      { value: new Decimal(1e3), symbol: 'K' }, // mil
    ];

    for (const u of units) {
      if (abs.gte(u.value)) {
        const normalized = abs.div(u.value);
        const decimals = normalized.lt(10)
          ? Math.min(2, maxDecimals)
          : normalized.lt(100)
          ? Math.min(1, maxDecimals)
          : 0;

        try {
          const formatted = normalized
            .toFixed(decimals)
            .replace(/\.0+$/, '')
            .replace(/(\.[0-9]*[1-9])0+$/, '$1');
          return `${sign}${formatted}${u.symbol}`;
        } catch {
          // usar notación científica como fallback
          return `${sign}${normalized.toExponential(2)}${u.symbol}`;
        }
      }
    }

    // Mostrar número completo si es menor a 1000
    if (abs.lt(10000)) {
      try {
        const formatted = abs
          .toFixed(maxDecimals)
          .replace(/\.0+$/, '')
          .replace(/(\.[0-9]*[1-9])0+$/, '$1');
        return `${sign}${formatted}`;
      } catch {
        // usar el valor sin formato como fallback
        return `${sign}${abs.toString()}`;
      }
    }

    // Fallback para números que no coincidan con ninguna escala
    try {
      return `${sign}${abs.toFixed(0)}`;
    } catch {
      return `${sign}${abs.toString()}`;
    }
  }
}
