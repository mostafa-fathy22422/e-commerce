import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild
} from '@angular/core';
import { LoadingCardComponent } from '../../shared/components/loading-card/loading-card.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { Product } from '../../core/models/API.interface';
import { ProductsService } from '../../core/services/products/products.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { finalize, Subject, takeUntil } from 'rxjs';
import { CommonModule, isPlatformServer } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { WishListService } from '../../core/services/wish-list/wish-list.service'; // <-- IMPORT Router and ActivatedRoute

@Component({
  selector: 'app-products',
  imports: [
    LoadingCardComponent,
    CardComponent,
    FormsModule,
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsComponent implements OnInit, OnDestroy {
  isLoading: boolean = true;

  products: Product[] = [];

  itemsPerPage: number = 12;
  itemsPerLoadingPage: number[] = [];
  numberOfPages: number = 0; // get the number of page from api
  pages: number[] = []; // set array of pages
  currentPage: number = 1; //For changing the style and routing

  @ViewChild('productsSection') productsSection!: ElementRef;

  private destroy$ = new Subject<void>();
  private readonly platformId = inject(PLATFORM_ID);
  private readonly productsService = inject(ProductsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly wishListService = inject(WishListService);

  constructor() {}

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const page = Number(params.get('page')) || 1;
      const limit = Number(params.get('limit')) || 12;
      this.currentPage = page;
      this.itemsPerPage = limit;
      this.getAllProducts(this.currentPage, this.itemsPerPage);
      this.updateLoadingSkeletons();
      this.scrollToTop();
    });
    // Subscribe to wishlist updates to refresh view when items are added/removed
    this.wishListService.wishListUpdated$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      // When the wishlist is updated, mark the component for change detection
      // to update the heart icon state in the card components.
      this.cdr.markForCheck();
    });
    // Listen for search input changes
  }

  // !call API
  getAllProducts(page: number, limit: number): void {
    this.isLoading = true;
    this.productsService
      .getProducts({ page, limit })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (res) => {
          this.products = res.data;
          this.numberOfPages = res.metadata.numberOfPages;
          this.pages = Array.from({ length: this.numberOfPages }, (_, i) => i + 1);
        },
        error: (err) => {
          console.error('Failed to fetch products:', err);
        },
      });
  }

  updateLoadingSkeletons(): void {
    this.itemsPerLoadingPage = Array(this.itemsPerPage).fill(0);
  }

  onPageChange(page: number): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: page, limit: this.itemsPerPage },
      queryParamsHandling: 'merge', // Merge with existing query params
    });
  }

  onItemsPerPageChange(numberOfPage: number): void {
    this.itemsPerPage = Number(numberOfPage);
    // Update URL to reflect changes
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: 1, limit: this.itemsPerPage },
      queryParamsHandling: 'merge',
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private scrollToTop(): void {
    if (isPlatformServer(this.platformId)) return;
    if (this.productsSection?.nativeElement) {
      this.productsSection.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }
}
