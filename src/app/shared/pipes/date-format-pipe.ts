import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat',
  standalone: true
})
export class DateFormatPipe implements PipeTransform {
  transform(value: string | Date | null | undefined, format: 'short' | 'long' | 'relative' = 'short'): string {
    if (!value) return '—';
    const date = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(date.getTime())) return '—';

    if (format === 'relative') {
      const now = Date.now();
      const diff = now - date.getTime();
      const days = Math.floor(diff / 86400000);
      if (days === 0) return 'Aujourd\'hui';
      if (days === 1) return 'Hier';
      if (days < 7) return `Il y a ${days} jours`;
      if (days < 30) return `Il y a ${Math.floor(days / 7)} semaine(s)`;
      return `Il y a ${Math.floor(days / 30)} mois`;
    }

    const options: Intl.DateTimeFormatOptions = format === 'long'
      ? { day: '2-digit', month: 'long', year: 'numeric' }
      : { day: '2-digit', month: '2-digit', year: 'numeric' };

    return new Intl.DateTimeFormat('fr-FR', options).format(date);
  }
}
