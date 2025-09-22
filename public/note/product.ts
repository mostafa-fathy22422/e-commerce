// import {
//   ChangeDetectionStrategy,
//   ChangeDetectorRef,
//   Component,
//   ElementRef,
//   inject,
//   OnDestroy,
//   OnInit,
//   PLATFORM_ID,
//   ViewChild,
// } from '@angular/core';
// import { LoadingCardComponent } from '../../shared/components/loading-card/loading-card.component';
// import { CardComponent } from '../../shared/components/card/card.component';
// import { Product } from '../../core/models/API.interface';
// import { ProductsService } from '../../core/services/products/products.service';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
// import { CommonModule, isPlatformServer } from '@angular/common';
// import { ActivatedRoute, Router, RouterLink } from '@angular/router';
// import { WishListService } from '../../core/services/wish-list/wish-list.service';
//
// export class Products implements OnInit, OnDestroy {
//   isLoading: boolean = true;
//   search: string = '';
//   private allProducts: Product[] = [];
//   Products: Product[] = [];
//
//   itemsPerPage: number = 12;
//   itemsPerLoadingPage: number[] = [];
//   numberOfPages: number = 0;
//   pages: number[] = [];
//   currentPage: number = 1;
//
//   @ViewChild('productsSection') productsSection!: ElementRef;
//
//   private searchSubject = new Subject<string>();
//   private destroy$ = new Subject<void>();
//
//   private id = inject(PLATFORM_ID);
//
//   constructor(
//     private readonly productsService: ProductsService,
//     private readonly cdr: ChangeDetectorRef,
//     private readonly router: Router,
//     private readonly route: ActivatedRoute,
//     private readonly wishListService: WishListService // <-- Inject WishListService
//   ) {}
//
//   ngOnInit(): void {
//     this.fetchAllProducts();
//
//     this.route.queryParamMap
//       .pipe(takeUntil(this.destroy$))
//       .subscribe((params) => {
//         this.currentPage = Number(params.get('page')) || 1;
//         this.itemsPerPage = Number(params.get('limit')) || 12;
//         this.getNumberOfLoadingPages();
//
//         if (this.allProducts.length > 0) {
//           this.updateView();
//           this.scrollToTop();
//         }
//       });
//
//     this.searchSubject
//       .pipe(
//         debounceTime(300),
//         distinctUntilChanged(),
//         takeUntil(this.destroy$)
//       )
//       .subscribe(() => {
//         this.currentPage = 1;
//         this.updateView();
//       });
//
//     // Subscribe to wishlist updates to refresh view when items are added/removed
//     this.wishListService.wishListUpdated$
//       .pipe(takeUntil(this.destroy$))
//       .subscribe(() => {
//         // When wishlist is updated, we may want to refresh the view
//         // This will trigger change detection for card components
//         this.cdr.markForCheck();
//       });
//   }
//
//   // !call API
//   fetchAllProducts() {
//     this.isLoading = true;
//     this.productsService.getProducts().subscribe({
//       next: (res) => {
//         this.allProducts = res.data;
//         this.isLoading = false;
//         this.updateView();
//         this.cdr.markForCheck();
//       },
//       error: (err) => {
//         this.isLoading = false;
//         this.allProducts = [];
//         this.updateView();
//         this.cdr.markForCheck();
//         console.log(err);
//       },
//     });
//   }
//
//
//
//   getNumberOfLoadingPages() {
//     this.itemsPerLoadingPage = Array(this.itemsPerPage).fill(0);
//   }
//
//   onItemsPerPageChange($event: any) {
//     this.itemsPerPage = Number($event);
//     this.router.navigate([], {
//       relativeTo: this.route,
//       queryParams: { page: 1, limit: this.itemsPerPage },
//       queryParamsHandling: 'merge',
//     });
//   }
//
//   private scrollToTop(): void {
//     if (isPlatformServer(this.id)) return;
//     if (this.productsSection?.nativeElement) {
//       this.productsSection.nativeElement.scrollIntoView({
//         behavior: 'smooth',
//         block: 'start',
//       });
//     }
//   }
//
//   ngOnDestroy(): void {
//     this.destroy$.next();
//     this.destroy$.complete();
//   }
//
//   private updateView(): void {
//     let searchResult = this.allProducts;
//     if (this.search) {
//       searchResult = this.allProducts.filter((p) =>
//         p.title.toLowerCase().includes(this.search.toLowerCase()),
//       );
//     }
//
//     this.numberOfPages = Math.ceil(searchResult.length / this.itemsPerPage);
//     this.pages = Array.from({ length: this.numberOfPages }, (_, i) => i + 1);
//
//     if (this.currentPage > this.numberOfPages) {
//       this.currentPage = this.numberOfPages || 1;
//     }
//
//     const startIndex = (this.currentPage - 1) * this.itemsPerPage;
//     const endIndex = startIndex + this.itemsPerPage;
//     this.Products = searchResult.slice(startIndex, endIndex);
//
//     this.cdr.markForCheck();
//   }
// }
