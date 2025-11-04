import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'short',
  standalone: true,
})
export class ShortNumberPipe implements PipeTransform {
  transform(value: number | string | null | undefined, maxDecimals = 2): string {
    const num = typeof value === 'string' ? parseFloat(value) : (value ?? 0);
    if (!isFinite(num)) return String(value ?? '0');

    const sign = num < 0 ? '-' : '';
    const abs = Math.abs(num);

    // si el número es menor a 10.000 mostrarlo completo (ya es mu corto)
    if (abs < 10000) {
      if (Number.isInteger(num)) {
        return `${sign}${Math.abs(num)}`;
      } else {
        return `${sign}${Math.abs(num).toFixed(maxDecimals).replace(/\.0+$/, '').replace(/(\.[0-9]*[1-9])0+$/, '$1')}`;
      }
    }

    // B es mil millones (billion en inglés), T es billón (trillion en inglés)
    // está en ingles, pero los sufijos son universales en el contexto de números grandes
    // lo mismo con el k, que sería m en español xD
    const units: { value: number; symbol: string }[] = [
      { value: 1e15, symbol: 'P' }, // mil billones
      { value: 1e12, symbol: 'T' }, // billón
      { value: 1e9, symbol: 'B' },  // mil millones
      { value: 1e6, symbol: 'M' },  // millón
      { value: 1e3, symbol: 'K' },  // mil
    ];

    for (const u of units) {
      if (abs >= u.value) {
        const normalized = abs / u.value;
        const decimals = normalized < 10 ? Math.min(2, maxDecimals) : normalized < 100 ? Math.min(1, maxDecimals) : 0;

        // quita ceros innecesarios
        const formatted = Number(normalized.toFixed(decimals)).toString();
        return `${sign}${formatted}${u.symbol}`;
      }
    }

    return `${sign}${Math.round(num).toString()}`;
  }
}
