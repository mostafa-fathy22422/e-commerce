import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Product, Response as ApiResponse } from '../../models/API.interface';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private readonly http = inject(HttpClient);
  private readonly _apiUrl = `${environment.baseUrl}products`;

  /**
   * Fetches a list of products. Supports pagination.
   * @param options - Optional pagination parameters.
   * @returns An Observable of the API response containing products.
   */
  getProducts(options?: { page?: number; limit?: number }): Observable<ApiResponse<Product>> {
    let params = new HttpParams();
    if (options?.page) {
      params = params.set('page', options.page.toString());
    }
    if (options?.limit) {
      params = params.set('limit', options.limit.toString());
    }

    return this.http.get<ApiResponse<Product>>(this._apiUrl, {
      params,
    });
  }

  getProductDetails(id: string): Observable<Product> {
    return this.http.get<{ data: Product }>(`${this._apiUrl}/${id}`).pipe(map((res) => res.data));
  }
}
