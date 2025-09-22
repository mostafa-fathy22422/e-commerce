import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Product } from '../../models/API.interface';
import { isPlatformBrowser } from '@angular/common';

const CACHE_KEY = 'allProductsCache';
const CACHE_DURATION_MINUTES = 60; // Cache data for 1 hour

@Injectable({
  providedIn: 'root',
})
export class ProductCacheService {
  private id = inject(PLATFORM_ID);
  saveProducts(products: Product[]): void {
    if (!isPlatformBrowser(this.id)) {
      return;
    }

    const cacheData = {
      timestamp: new Date().getTime(),
      products: products,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  }

  loadProducts(): Product[] | null {
    if (!isPlatformBrowser(this.id)) {
      return null;
    }

    const cachedItem = localStorage.getItem(CACHE_KEY);
    if (!cachedItem) {
      return null; // Nothing in cache
    }

    const cacheData = JSON.parse(cachedItem);

    if (!this.isCacheValid(cacheData.timestamp)) {
      localStorage.removeItem(CACHE_KEY); // Cache has expired, clear it
      return null;
    }

    return cacheData.products;
  }

  clearCache(): void {
    if (!isPlatformBrowser(this.id)) {
      return;
    }

    localStorage.removeItem(CACHE_KEY);
  }

  private isCacheValid(timestamp: number): boolean {
    const now = new Date().getTime();
    const ageInMinutes = (now - timestamp) / 1000 / 60;
    return ageInMinutes < CACHE_DURATION_MINUTES;
  }
}
