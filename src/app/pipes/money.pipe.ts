import { Pipe, PipeTransform } from '@angular/core';
import { formatNumber } from '@angular/common';

import { environment } from '../../environments/environment';

/** Formatea un monto con 2 decimales y, si está configurado, el símbolo de moneda. */
@Pipe({ name: 'money' })
export class MoneyPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return '';
    }

    const amount = formatNumber(value, 'en-US', '1.2-2');
    return environment.currency ? `${environment.currency} ${amount}` : amount;
  }
}
