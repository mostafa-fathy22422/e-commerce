import { Component, inject, OnInit } from '@angular/core';
import { userOrders } from '../../core/models/all-orders.interface';
import { AllOrdersService } from '../../core/services/all-orders/all-orders.service';
import { filter, Observable } from 'rxjs';
import { AsyncPipe, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-all-orders',
  imports: [AsyncPipe, DatePipe, CurrencyPipe, RouterLink, TranslatePipe],
  templateUrl: './all-orders.component.html',
  styleUrl: './all-orders.component.css',
})
export class AllOrdersComponent implements OnInit {
  // This handles subscription and unsubscription automatically.
  allOrders$!: Observable<userOrders>;
  // Use the observable directly in the template with the async pipe
  private allOrdersService = inject(AllOrdersService);
  isLoading$: Observable<boolean> = this.allOrdersService.isLoading$;

  ngOnInit(): void {
    this.allOrdersService.refreshOrders();
    this.allOrders$ = this.allOrdersService.allOrders$.pipe(
      filter((orders): orders is userOrders => orders !== null && orders !== undefined),
    );
  }
}
