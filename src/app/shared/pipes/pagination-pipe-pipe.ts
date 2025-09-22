import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'paginationPipe',
})
export class PaginationPipePipe implements PipeTransform {
  transform(array: any[], page: number = 1, itemsPerPage: number = 10): any[] {
    if (!array || array.length === 0) {
      return [];
    }

    // Calculate start and end index
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // Return sliced array for current page
    return array.slice(startIndex, endIndex);
  }
}
