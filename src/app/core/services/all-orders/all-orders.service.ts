import { inject, Injectable, makeStateKey, PLATFORM_ID, TransferState } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AlertService } from '../alert.service';
import { environment } from '../../../../environments/environment';
import { BehaviorSubject, catchError, finalize, Observable, of, tap, throwError } from 'rxjs';
import { userOrders } from '../../models/all-orders.interface';
import { DecodeTokenService } from '../decode-token.service';

@Injectable({
  providedIn: 'root',
})
export class AllOrdersService {
  private http = inject(HttpClient);
  private alertService = inject(AlertService);
  private transferState = inject(TransferState);
  private platformId = inject(PLATFORM_ID);
  private readonly _apiUrl = `${environment.baseUrl}orders/user`;
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();
  private decodeTokenService = inject(DecodeTokenService);

  private allOrdersSubject = new BehaviorSubject<userOrders | null>(null);
  readonly allOrders$ = this.allOrdersSubject.asObservable();

  constructor() {
    // When user data becomes available (on login or page load), fetch their orders.
    // This single subscription handles both initial load and subsequent logins.
    this.decodeTokenService.userData$.subscribe((user) => {
      if (user && user.id) {
        // We subscribe here to trigger the fetch, but the result is pushed
        // to the allOrdersSubject from within fetchOrdersByUserId.
        this.fetchOrdersByUserId(user.id).subscribe();
      } else {
        // If user logs out, clear the orders.
        this.allOrdersSubject.next(null);
      }
    });
  }

  /**
   * Re-fetches the orders for the current user.
   * Can be called after an action like placing a new order.
   */
  refreshOrders(): void {
    this.decodeTokenService.userData$.subscribe((user) => {
      if (user && user.id) {
        // We subscribe here to trigger the fetch, but the result is pushed
        // to the allOrdersSubject from within fetchOrdersByUserId.
        this.fetchOrdersByUserId(user.id).subscribe();
      } else {
        // If user logs out, clear the orders.
        this.allOrdersSubject.next(null);
      }
    });
  }

  fetchOrdersByUserId(userId: string): Observable<userOrders> {
    const ORDERS_KEY = makeStateKey<userOrders>(`user-orders-${userId}`);

    // First, check if the data is already in the TransferState (on the client)
    if (this.transferState.hasKey(ORDERS_KEY)) {
      const orders = this.transferState.get(ORDERS_KEY, null);
      this.transferState.remove(ORDERS_KEY); // Clean up the key after reading
      if (orders) {
        this.allOrdersSubject.next(orders);
        return of(orders); // Return data as an observable without an HTTP call
      }
    }

    // If not in TransferState, fetch from the API
    this.isLoadingSubject.next(true);
    return this.http.get<userOrders>(`${this._apiUrl}/${userId}`).pipe(
      tap((orders) => {
        // If running on the server, store the result in TransferState
        if (isPlatformServer(this.platformId)) {
          this.transferState.set(ORDERS_KEY, orders);
        }
        this.allOrdersSubject.next(orders);
      }),
      catchError((err) => {
        this.alertService.addAlert(5, err.error.message || '');
        return throwError(() => err);
      }),
      finalize(() => this.isLoadingSubject.next(false)),
    );
  }
}
