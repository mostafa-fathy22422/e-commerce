import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, Observable, take } from 'rxjs';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputComponent } from '../../shared/components/input/input.component';
import { AlertService } from '../../core/services/alert.service';
import { CartService } from '../../core/services/cart/cart.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-check-out',
  imports: [FormsModule, ReactiveFormsModule, InputComponent, TranslatePipe],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckOutComponent implements OnInit {
  // Public properties
  isLoading = false;

  // Protected properties
  protected checkoutForm!: FormGroup;

  // Private properties
  private route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private fb = inject(FormBuilder);
  private alertService = inject(AlertService);
  private cartService = inject(CartService);
  private cartId: string | null = null;

  ngOnInit(): void {
    this.route.paramMap.pipe(take(1)).subscribe((paramsMap) => {
      this.cartId = paramsMap.get('id');
    });

    this.initCheckoutForm();
  }

  handleSubmit(): void {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }
    if (!this.cartId) {
      return;
    }
    this.isLoading = true;
    this.checkout();
  }

  private checkout(): void {
    const { paymentMethod, ...shippingAddress } = this.checkoutForm.value;
    let checkoutObservable: Observable<any>;
    if (paymentMethod === 'credit') {
      checkoutObservable = this.cartService.checkoutSessionCredit(this.cartId!, shippingAddress);
    } else {
      checkoutObservable = this.cartService.checkoutSessionDelivered(this.cartId!, shippingAddress);
    }

    checkoutObservable.pipe(finalize(() => (this.isLoading = false))).subscribe({
      next: () => {
        if (paymentMethod === 'delivered') {
          this.router.navigate(['/allorders']);
        }
      }
    });
  }

  private initCheckoutForm(): void {
    this.checkoutForm = this.fb.group({
      details: ['', [Validators.required, Validators.minLength(10)]],
      phone: ['', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
      city: ['', [Validators.required, Validators.minLength(5)]],
      paymentMethod: ['credit', Validators.required],
    });
  }
}
