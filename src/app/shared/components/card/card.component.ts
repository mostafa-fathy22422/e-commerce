import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
// Services
import { CartService } from '../../../core/services/cart/cart.service';
import { AlertService } from '../../../core/services/alert.service';
import { WishListService } from '../../../core/services/wish-list/wish-list.service';
// Interfaces
import { Product } from '../../../core/models/API.interface';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [RouterLink, NgOptimizedImage],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css',
})
export class CardComponent implements OnInit, OnDestroy {
  // --- Component Inputs ---
  @Input({ required: true }) product!: Product;
  @Input() index!: number;
  // --- State ---
  isProductInWishList = false;
  // --- Injected Services ---
  private readonly cartService = inject(CartService);
  private readonly wishListService = inject(WishListService);
  private readonly alertService = inject(AlertService);
  private wishListSub!: Subscription;
  ngOnInit(): void {
    this.wishListSub = this.wishListService.wishListIds$.subscribe((ids) => {
      this.isProductInWishList = ids.has(this.product._id);
    });
  }

  ngOnDestroy(): void {
    this.wishListSub?.unsubscribe();
  }
  // --- Public Methods ---

  /**
   * Adds the product to the shopping cart and displays a notification.
   * @param productId The ID of the product to add.
   */
  addToCart(productId: string): void {
    //const action$ = this.cartService.addToCart(productId);
    this.cartService.addToCart(productId).subscribe();
    // this._handleAction(action$, 'Product added successfully to your cart');
  }

  /**
   * Toggles the product's presence in the wishlist.
   * If the product is in the wishlist, it removes it. Otherwise, it adds it.
   * @param productId The ID of the product to toggle.
   */
  toggleWishList(productId: string): void {
    let action$: Observable<{ message: string }>;
    let successMessage: string;

    if (this.isProductInWishList) {
      action$ = this.wishListService.removeFromWishList(productId);
      successMessage = 'Product removed from your wishlist';
    } else {
      action$ = this.wishListService.addToWishList(productId);
      successMessage = 'Product added to your wishlist';
    }
    this._handleAction(action$, successMessage);
  }

  // --- Private Helper Methods ---

  private _handleAction(action$: Observable<{ message: string }>, successMessage: string): void {
    action$.subscribe({
      next: (res) => this.alertService.addAlert(1, res.message || successMessage),
      error: (err) =>
        this.alertService.addAlert(5, err.error.message || 'An unknown error occurred'),
    });
  }

  private getWishList() {}
}
