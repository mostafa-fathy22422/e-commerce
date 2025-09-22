import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { cart, shippingAddress } from '../../models/cart.interface';
import { AlertService } from '../alert.service';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { AllOrdersService } from '../all-orders/all-orders.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private http = inject(HttpClient);
  private alertService = inject(AlertService);
  private platformId = inject(PLATFORM_ID);
  private cookieService = inject(CookieService);
  private allOrdersService = inject(AllOrdersService);
  private cartSubject = new BehaviorSubject<cart | null>(null);
  cart$ = this.cartSubject.asObservable();

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.getCart().subscribe();
    }
  }

  getCart() {
    return this.http.get<cart>(`${environment.baseUrl}cart`).pipe(
      tap((cartData) => this.cartSubject.next(cartData)),
      catchError((err) => {
        this.cartSubject.next(null); // Clear cart on error
        this.alertService.addAlert(5, 'Failed to get cart items.');
        return throwError(() => err);
      }),
    );
  }

  removeFromCart(productId: string) {
    const originalCart = this.cartSubject.getValue();
    if (!originalCart) return throwError(() => new Error('Cart not found'));

    // Optimistic update
    const itemIndex = originalCart.data.products.findIndex((p) => p.product._id === productId);
    if (itemIndex === -1) return throwError(() => new Error('Product not in cart'));

    const updatedCart = JSON.parse(JSON.stringify(originalCart)); // Deep copy for rollback
    const removedItem = updatedCart.data.products[itemIndex];
    updatedCart.data.products.splice(itemIndex, 1);
    updatedCart.numOfCartItems--;
    updatedCart.data.totalCartPrice -= removedItem.price * removedItem.count;
    this.cartSubject.next(updatedCart);

    return this.http.delete<any>(`${environment.baseUrl}cart/${productId}`).pipe(
      tap((res) => {
        // On success, the API returns the updated cart. Use it as the source of truth.
        //  this.cartSubject.next(res);
        // console.log(res.data);
        this.alertService.addAlert(1, 'Product removed successfully');
      }),
      catchError((err) => {
        this.cartSubject.next(originalCart); // Rollback on error
        this.alertService.addAlert(5, err.error.message || 'Failed to remove product.');
        return throwError(() => err);
      }),
    );
  }

  updateQuantity(productId: string, action: 'increase' | 'decrease') {
    const currentCart = this.cartSubject.getValue();
    if (!currentCart) return;

    const product = currentCart.data.products.find((p) => p.product._id === productId);
    if (!product) return;

    let newCount = product.count;
    if (action === 'increase') {
      newCount++;
    } else {
      newCount--;
    }

    if (newCount < 1) {
      this.removeFromCart(productId).subscribe();
    } else {
      this.updateProductQuantity(productId, newCount).subscribe();
    }
  }

  updateProductQuantity(productId: string, count: number) {
    const originalCart = this.cartSubject.getValue();
    if (!originalCart) return throwError(() => new Error('Cart not found'));

    // Optimistic Update
    const updatedCart = JSON.parse(JSON.stringify(originalCart));
    const item = updatedCart.data.products.find((p: any) => p.product._id === productId);
    if (!item) return throwError(() => new Error('Product not in cart'));

    const priceDifference = (count - item.count) * item.price;
    item.count = count;
    updatedCart.data.totalCartPrice += priceDifference;
    this.cartSubject.next(updatedCart);

    return this.http
      .put<{ status: string; data: cart }>(`${environment.baseUrl}cart/${productId}`, { count })
      .pipe(
        tap((res) => {
          // The API returns the updated cart. We can use it to sync our state,
          // though our optimistic update should be very close.
          // this.cartSubject.next(res.data);
        }),
        catchError((err) => {
          if (originalCart) {
            this.cartSubject.next(originalCart); // Rollback on error
          }
          this.alertService.addAlert(5, err.error.message || 'Failed to update quantity.');
          return throwError(() => err);
        }),
      );
  }

  deleteCart() {
    const originalCart = this.cartSubject.getValue();
    if (!originalCart) return throwError(() => new Error('Cart is already empty'));

    // Optimistic update
    const emptyCartState: cart = {
      ...originalCart,
      numOfCartItems: 0,
      data: { ...originalCart.data, products: [], totalCartPrice: 0 },
    };
    this.cartSubject.next(emptyCartState);

    return this.http.delete(`${environment.baseUrl}cart`).pipe(
      tap(() => {
        this.alertService.addAlert(1, 'Cart cleared successfully');
        // State is already empty, no need to update from response
      }),
      catchError((err) => {
        this.cartSubject.next(originalCart); // Rollback
        this.alertService.addAlert(5, err.error.message || 'Failed to clear cart.');
        return throwError(() => err);
      }),
    );
  }
  addToCart(productId: string): Observable<cart> {
    return this.http
      .post<cart>(
        `${environment.baseUrl}cart`,
        { productId },
        {
          headers: {
            token: this.cookieService.get('userToken') || '',
          },
        },
      )
      .pipe(
        tap(() => {
          this.alertService.addAlert(1, 'Product added to cart successfully');
          // After successfully adding, refetch the cart to get the definitive state
          this.getCart().subscribe();
        }),
        catchError((err) => {
          this.alertService.addAlert(5, err.error.message || 'Failed to add product to cart.');
          return throwError(() => err);
        }),
      );
  }

  checkoutSessionCredit(cartId: string, shippingAddress: any) {
    return this.http
      .post<{
        session: { url: string };
      }>(`${environment.baseUrl}orders/checkout-session/${cartId}?url=https://e-commerce-delta-opal.vercel.app`, {
        shippingAddress,
      })
      .pipe(
        tap((res) => {
          window.location.href = res.session.url;
        }),
        catchError((err) => {
          this.alertService.addAlert(5, 'Checkout failed. Please try again.');
          return throwError(() => err);
        }),
      );
  }
  checkoutSessionDelivered(cartId: string, shippingAddress: shippingAddress) {
    return this.http
      .post<any>(
        `${environment.baseUrl}orders/${cartId}`,
        { shippingAddress },
        {
          headers: {
            token: this.cookieService.get('userToken') || '',
          },
        },
      )
      .pipe(
        tap(() => {
          this.alertService.addAlert(1, 'Order placed successfully');
          this.allOrdersService.refreshOrders();
          this.cartSubject.next(null); // Clear cart after successful order
        }),
        catchError((err) => {
          this.alertService.addAlert(5, 'Order placement failed. Please try again.');
          return throwError(() => err);
        }),
      );
  }
}
