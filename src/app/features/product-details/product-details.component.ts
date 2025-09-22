import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../core/services/products/products.service';
import { Product } from '../../core/models/API.interface';
import { ActivatedRoute } from '@angular/router';
import { LoadingPageComponent } from './components/loading-page/loading-page.component';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-product-details',
  imports: [LoadingPageComponent, NgOptimizedImage],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css',
})
export class ProductDetailsComponent implements OnInit {
  product: Product | null = null;
  isImgChanged: boolean = false;
  imageSrc: string | undefined;
  isLoading = true; // Add this property

  constructor(
    private readonly productsService: ProductsService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((paramsMap) => {
      const id = paramsMap.get('id');
      if (!id) {
        return;
      }
      this.getProductDetails(id);
    });
  }

  getProductDetails(id: string) {
    this.isLoading = true; // Set loading to true when starting
    this.productsService.getProductDetails(id).subscribe({
      next: (response) => {
        this.product = response;
        // Initialize imageSrc with the main cover image
        this.imageSrc = this.product.imageCover;
        this.isLoading = false;
      },
    });
  }

  changSrcImage(src: string) {
    this.imageSrc = src;
  }
}
