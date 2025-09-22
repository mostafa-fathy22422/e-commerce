import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs';
import { Category, Response } from '../../models/API.interface';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private readonly http = inject(HttpClient);
  private readonly _apiUrl = `${environment.baseUrl}categories`;
  getAllCategories(): Observable<Response<Category>> {
    return this.http.get<Response<Category>>(`${this._apiUrl}`);
  }
}
