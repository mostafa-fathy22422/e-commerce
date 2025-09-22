import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// The environment import is used to get the base URL for the API.
import { environment } from '../../../../environments/environment.development';
import { BehaviorSubject, catchError, Observable, Subject, tap, throwError } from 'rxjs';
import { WishList } from '../../models/API.interface';

type WishListModificationResponse = {
  message: string;
  data: string[];
  status: string;
};

/**
 * Service for managing the user's wishlist.
 * It handles fetching, adding, and removing items from the wishlist,
 * employing an optimistic UI update strategy for a responsive user experience.
 */
@Injectable({
  providedIn: 'root',
})
export class WishListService {
  private httpClient = inject(HttpClient);

  // The base URL for wishlist-related API endpoints.
  private readonly _apiUrl = `${environment.baseUrl}wishlist`;

  // A Subject that emits the updated list of wishlist IDs from the server response
  // after a successful modification (add/remove).
  private wishListUpdated = new Subject<string[]>();
  // A BehaviorSubject that holds the current set of wishlist product IDs for local state management.
  /** An observable that components can subscribe to for updates after a successful API call. */
  wishListUpdated$ = this.wishListUpdated.asObservable();
  // This enables optimistic UI updates.
  private wishListIds = new BehaviorSubject<Set<string>>(new Set());
  /** An observable of the current set of wishlist IDs, used for displaying wishlist status in the UI. */
  wishListIds$ = this.wishListIds.asObservable();

  /**
   * Fetches the initial wishlist and populates the local state.
   * This should be called once when the application loads for a logged-in user.
   */
  initializeWishList(): void {
    this.getWishList().subscribe({
      next: (res) => {
        const wishListProductIds = new Set(res.data.map((item) => item.id));
        this.wishListIds.next(wishListProductIds);
      },
      error: (err) => {
        console.error('Failed to initialize wishlist:', err);
        this.wishListIds.next(new Set()); // Ensure it's empty on error
      },
    });
  }
  /**
   * Fetches the complete wishlist from the server.
   * @returns An observable of the user's wishlist.
   */
  getWishList(): Observable<WishList> {
    return this.httpClient.get<WishList>(this._apiUrl);
  }

  /**
   * Adds a product to the wishlist.
   * It first optimistically updates the local state, then makes the API call.
   * If the API call fails, it reverts the local state change.
   * @param productId The ID of the product to add.
   * @returns An observable of the API response.
   */
  addToWishList(productId: string): Observable<WishListModificationResponse> {
    // Optimistic update: Add the ID to the local set immediately.
    // const currentIds = new Set(this.wishListIds.getValue()).add(productId);
    // this.wishListIds.next(currentIds);
    const currentIds = this.wishListIds.getValue();
    const newIds = new Set(currentIds).add(productId); // Create a new Set
    this.wishListIds.next(newIds); // Optimistic update with the new Set
    return this.httpClient.post<WishListModificationResponse>(this._apiUrl, { productId }).pipe(
      tap((response) => {
        // On success, we don't need to do anything to the wishListIds,
        // because our optimistic update was correct. We just notify other components.
        this.wishListUpdated.next(response.data);
      }),
      catchError((err) => {
        // If this specific call fails, roll back the optimistic update for this ID.
        const currentIds = new Set(this.wishListIds.getValue()); // Get the latest state
        currentIds.delete(productId);
        this.wishListIds.next(currentIds);
        return throwError(() => err); // Re-throw the error for the component to handle.
      }),
    );
  }

  /**
   * Removes a product from the wishlist.
   * It first optimistically updates the local state, then makes the API call.
   * If the API call fails, it reverts the local state change.
   * @param productId The ID of the product to remove.
   * @returns An observable of the API response.
   */
  removeFromWishList(productId: string): Observable<WishListModificationResponse> {
    // Optimistic update: Remove the ID from the local set immediately.
    const currentIds = new Set(this.wishListIds.getValue());
    // currentIds.delete(productId);
    // this.wishListIds.next(currentIds);
    const newIds = new Set(currentIds); // Create a new Set
    newIds.delete(productId);
    this.wishListIds.next(newIds); // Optimistic update with the new Set
    return this.httpClient
      .delete<WishListModificationResponse>(`${this._apiUrl}/${productId}`)
      .pipe(
        tap((response) => {
          // On success, the optimistic update was correct. Just notify.
          this.wishListUpdated.next(response.data);
        }),
        catchError((err) => {
          // If the delete fails, roll back by adding the ID back to the set.
          const currentIds = new Set(this.wishListIds.getValue()).add(productId); // Get the latest state
          this.wishListIds.next(currentIds);
          return throwError(() => err); // Re-throw the error.
        }),
      );
  }

  /**
   * Manually notifies subscribers that the wishlist has been updated.
   */
  notifyWishListUpdate(): void {
    this.wishListUpdated.next([]); // We can emit an empty array as the payload isn't used by the navbar
  }
}
