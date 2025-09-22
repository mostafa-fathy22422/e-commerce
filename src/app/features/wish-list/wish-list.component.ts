import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output
} from '@angular/core';
import { animate, AnimationEvent, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { WishListService } from '../../core/services/wish-list/wish-list.service';
import { WishList } from '../../core/models/API.interface';
import { AlertService } from '../../core/services/alert.service';
import { finalize, Subscription, tap } from 'rxjs';
import { CartService } from '../../core/services/cart/cart.service';

@Component({
  selector: 'app-wish-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wish-list.component.html',
  styleUrl: './wish-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideInOut', [
      state('in', style({ transform: 'translateY(0) scale(1)', opacity: 1 })),
      state('out', style({ transform: 'translateY(4%) scale(1.05)', opacity: 0 })),
      state('void', style({ transform: 'translateY(4%) scale(1.05)', opacity: 0 })),
      transition('void => in', [animate('200ms ease-out')]),
      transition('in => out', [animate('200ms ease-in')]),
    ]),
    trigger('fadeInOut', [
      state('in', style({ opacity: 1 })),
      state('out', style({ opacity: 0 })),
      state('void', style({ opacity: 0 })),
      transition('void => in', [animate('200ms ease-out')]),
      transition('in => out', [animate('200ms ease-in')]),
    ]),
  ],
})
export class WishListComponent implements OnChanges {
  isLoading: boolean = false;
  wishList: WishList = { status: '', count: 0, data: [] };

  @Input()
  showWishList: boolean = false;
  @Output()
  showWishListChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output()
  sendWishListCount: EventEmitter<number> = new EventEmitter<number>();

  isDisplaying = false;
  private subscriptions = new Subscription();
  constructor(
    private wishListService: WishListService,
    private cdr: ChangeDetectorRef,
    private alertService: AlertService,
    private cartService: CartService,
  ) {}

  getWishList() {
    this.isLoading = true;
    this.subscriptions.add(
      this.wishListService
        .getWishList()
        .pipe(
          tap({
            next: (res) => (this.wishList = res),
            error: (err) => console.error('Failed to fetch wishlist:', err), // Use console.error for errors
          }),
          finalize(() => {
            this.isLoading = false;
            this.cdr.markForCheck();
          }),
        )
        .subscribe(),
    );
  }
  removeFromWishList(productId: string) {
    // --- Optimistic UI Update ---
    // We can still update the local list for a faster perceived UI response,
    // but the service's optimistic update is the primary driver for other components.
    const itemIndex = this.wishList.data.findIndex((item) => item.id === productId);
    if (itemIndex > -1) {
      this.wishList.data.splice(itemIndex, 1);
      this.wishList.count = this.wishList.data.length;
      this.cdr.markForCheck();
    }

    // --- Call the service to update the backend ---
    // The service will perform its own optimistic update on wishListIds$,
    // which will notify all CardComponents.
    this.subscriptions.add(
      this.wishListService.removeFromWishList(productId).subscribe({
        next: (res) => {
          this.alertService.addAlert(1, res.message);
          // The service's `removeFromWishList` already notifies `wishListUpdated$` on success,
          // so the explicit call to `notifyWishListUpdate` is no longer needed here.
          // The navbar will update automatically.
        },
        error: (err) => {
          this.alertService.addAlert(5, err.error.message);
          console.error('Failed to remove item from wishlist:', err); // Use console.error
          // If the API call fails, we should refresh the list to get the true state from the server.
          this.getWishList();
        },
      }),
    );
  }

  onAnimationDone(event: AnimationEvent) {
    if (event.toState === 'out') {
      this.isDisplaying = false;
    }
  }

  close() {
    this.showWishListChange.emit(false);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngOnChanges() {
    if (!this.isDisplaying) {
      // When the wishlist is first opened
      this.isDisplaying = true;
      this.getWishList(); // Fetch a fresh list
    }
  }

  addToCart(id: string) {
    this.subscriptions.add(
      this.cartService.addToCart(id).subscribe({
        next: (res) => {
          // this.alertService.addAlert(1, res.message);
          // Optionally remove from wishlist on successful add to cart
        },
        error: (err) => {
          this.alertService.addAlert(5, err.error.message);
          console.error('Failed to add item to cart:', err);
        },
      }),
    );
  }
}
