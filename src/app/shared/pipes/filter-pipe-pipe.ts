import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterPipe',
})
export class FilterPipePipe implements PipeTransform {
  transform(list: any[], filter: string): any[] {
    return list.filter((item) => {
      return item.title.toLowerCase().includes(filter.toLowerCase());
    });
  }
}
