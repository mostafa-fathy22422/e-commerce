import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable, shareReplay } from 'rxjs';
import { Product, Response as ApiResponse } from '../../models/API.interface';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private readonly http = inject(HttpClient);
  private readonly _apiUrl = `${environment.baseUrl}products`;

  // Cache to store observables for product lists based on URL
 // private productsCache = new Map<string, Observable<ApiResponse<Product>>>();

  getProducts(options?: { page?: number; limit?: number }): Observable<ApiResponse<Product>> {
    let params = new HttpParams();
    if (options?.page) {
      params = params.set('page', options.page.toString());
    }
    if (options?.limit) {
      params = params.set('limit', options.limit.toString());
    }

    // const requestUrl = `${this._apiUrl}?${params.toString()}`;
    //
    // // Check if the request is already in the cache
    // if (this.productsCache.has(requestUrl)) {
    //   return this.productsCache.get(requestUrl)!;
    // }
    //
    // // If not cached, create a new request and cache it
    // const newRequest$ = this.http
    //   .get<ApiResponse<Product>>(this._apiUrl, { params })
    //   .pipe(shareReplay(1)); // Cache the last emitted value
    //
    // this.productsCache.set(requestUrl, newRequest$);
    // return newRequest$;
    return this.http
      .get<ApiResponse<Product>>(this._apiUrl, { params })
  }

  getProductDetails(id: string): Observable<Product> {
    return this.http.get<{ data: Product }>(`${this._apiUrl}/${id}`).pipe(map((res) => res.data));
  }
}
