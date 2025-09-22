import { OperatorFunction, pipe } from 'rxjs';
import { map } from 'rxjs/operators';

export interface PaginatedResult<T> {
  paginatedData: T[];
  totalPages: number;
  currentPage: number;
}

export function paginate<T>(
  currentPage$: () => number,
  itemsPerPage: number,
): OperatorFunction<T[], PaginatedResult<T>> {
  return pipe(
    map((items: T[]) => {
      const totalPages = Math.ceil(items.length / itemsPerPage) || 1;
      const currentPage = Math.max(1, Math.min(currentPage$(), totalPages)); // Ensure page is within bounds

      const startIndex = (currentPage - 1) * itemsPerPage;
      const paginatedData = items.slice(startIndex, startIndex + itemsPerPage);

      return { paginatedData, totalPages, currentPage };
    }),
  );
}
