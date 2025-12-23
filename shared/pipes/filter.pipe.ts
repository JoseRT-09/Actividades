import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
  standalone: true
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], field: string, value: any): any[] {
    if (!items || !field) {
      return items;
    }

    if (value === null || value === undefined || value === '') {
      return items;
    }

    return items.filter(item => {
      const itemValue = item[field];
      if (itemValue === null || itemValue === undefined) {
        return false;
      }
      return itemValue === value;
    });
  }
}