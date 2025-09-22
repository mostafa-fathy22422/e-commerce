import { Component, ElementRef, inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { ProductsService } from '../../../../core/services/products/products.service';
import { Product } from '../../../../core/models/API.interface';
import { SearchComponent } from '../../../../shared/components/search/search.component';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  shareReplay,
  startWith
} from 'rxjs';
import { AsyncPipe, isPlatformServer } from '@angular/common';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
//import { WishListService } from '../../../../core/services/wish-list/wish-list.service';
import { LoadingCardComponent } from '../../../../shared/components/loading-card/loading-card.component';
import { paginate, PaginatedResult } from '../../../../shared/pipes/paginate.pipe';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-popular-products',
  // LoadingCardComponent is not used in the template, so it can be removed from imports.
  imports: [
    CardComponent,
    SearchComponent,
    PaginationComponent,
    LoadingCardComponent,
    AsyncPipe,
    TranslatePipe,
  ],
  templateUrl: './popular-products.component.html',
  styleUrl: './popular-products.component.css',
})
export class PopularProductsComponent implements OnInit {
  @ViewChild('productsSection') productsSection!: ElementRef; // For Scroll to Top
  // --- Observables ---
  products$!: Observable<PaginatedResult<Product>>;
  isLoading$!: Observable<boolean>;
  // --- Constants ---
  readonly itemsPerPage: number = 12;
  private readonly productsService = inject(ProductsService);
  //private readonly cdr = inject(ChangeDetectorRef);
  private readonly id = inject(PLATFORM_ID);
  // --- State Subjects ---
  private searchSubject = new BehaviorSubject<string>('');
  private pageSubject = new BehaviorSubject<number>(1);

  ngOnInit(): void {
    // Stream of all products from the API, cached with shareReplay
    const allProducts$ = this.productsService.getProducts().pipe(
      map((response) => response.data),
      startWith([]), // Emit an empty array initially
      shareReplay(1), // Cache the last emission
    );

    this.isLoading$ = allProducts$.pipe(map((products) => products.length === 0));

    // Debounced search term stream
    const searchTerm$ = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      startWith(''),
    );

    // Filtered products stream
    const filteredProducts$ = combineLatest([allProducts$, searchTerm$]).pipe(
      map(([products, term]) =>
        products.filter((p) => p.title.toLowerCase().includes(term.toLowerCase())),
      ),
    );

    // The final paginated stream for the view
    this.products$ = combineLatest([filteredProducts$, this.pageSubject]).pipe(
      // Destructure the array from combineLatest before passing to the paginate pipe
      map(([products, page]) => products),
      paginate(() => this.pageSubject.value, this.itemsPerPage),
    );
  }
  onSearchChange(searchValue: string): void {
    this.pageSubject.next(1); // Reset to page 1 on new search
    this.searchSubject.next(searchValue);
  }
  getPage(page: number) {
    this.pageSubject.next(page);
    this.scrollToProductsSection(80);
  }

  // Helper for creating page number array in the template
  getPagesArray(totalPages: number): number[] {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
    //! The traditional way
    // const pages = [];
    // for (let i = 1; i <= totalPages; i++) {
    //   pages.push(i);
    // }
    // return pages;
  }

  private scrollToProductsSection(offset: number = 0): void {
    if (isPlatformServer(this.id)) {
      return; // Can't scroll on the server
    }
    if (this.productsSection?.nativeElement) {
      // 1. Calculate the absolute top position of the element on the page
      const elementPosition =
        this.productsSection.nativeElement.getBoundingClientRect().top + window.scrollY;
      // 2. Calculate the final scroll position by subtracting the offset
      const yPosition = elementPosition - offset;
      // 3. Use window.scrollTo for precise control
      window.scrollTo({
        top: yPosition,
        behavior: 'smooth',
      });
    }
  }
}
