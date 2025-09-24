import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { Observable, shareReplay } from 'rxjs';
import { Category, Response } from '../../models/API.interface';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private readonly http = inject(HttpClient);
  private readonly _apiUrl = `${environment.baseUrl}categories`;

  // Cache the observable to prevent multiple API calls if requested multiple times
  private allCategories: Observable<Response<Category>> = this.http
    .get<Response<Category>>(`${this._apiUrl}`)
    .pipe(shareReplay(1));
  allCategories$ = this.allCategories;

  /**
   * Fetches a list of categories.
   * @returns An Observable of the API response containing categories.
   */
  constructor() {}
  // !call API
  // getAllCategories(): Observable<Response<Category>> {
  //   return this.http.get<Response<Category>>(`${this._apiUrl}`);
  // }
}
