import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CartService } from '../../core/services/cart/cart.service';
import { cart } from '../../core/models/cart.interface';
import { AsyncPipe, NgOptimizedImage } from '@angular/common';
import { AlertService } from '../../core/services/alert.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

// import { Subject } from 'rxjs';

@Component({
  selector: 'app-cart',
  imports: [NgOptimizedImage, AsyncPipe, RouterLink, TranslatePipe],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent implements OnInit, OnDestroy {
  cart$: Observable<cart | null>;

  private cartService = inject(CartService);
  private alertService = inject(AlertService);
  private destroy$ = new Subject<void>();
  private readonly cdr = inject(ChangeDetectorRef);

  constructor() {
    this.cart$ = this.cartService.cart$;
  }
  ngOnInit(): void {
    this.cartService.getCart().subscribe();
    this.cartService.cart$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      // When the wishlist is updated, mark the component for change detection
      // to update the heart icon state in the card components.
      this.cdr.markForCheck();
    });
  }

  removeFromCart(_id: string) {
    this.cartService.removeFromCart(_id).subscribe();
  }

  sendCount(id: string, action: 'increase' | 'decrease') {
    this.cartService.updateQuantity(id, action);
  }

  clearCart() {
    this.cartService.deleteCart().subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addMassage() {
    this.alertService.addAlert(1, 'The Cart Is Empty');
    console.log('The Cart Is Empty');
  }
}
