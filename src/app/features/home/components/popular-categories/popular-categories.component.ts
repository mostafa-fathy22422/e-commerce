import { Component, OnInit } from '@angular/core';
import { CategoriesService } from '../../../../core/services/categories/categories.service';
import { Category } from '../../../../core/models/API.interface';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-popular-categories',
  standalone: true,
  imports: [CarouselModule, NgOptimizedImage],
  templateUrl: './popular-categories.component.html',
  styleUrl: './popular-categories.component.css',
})
export class PopularCategoriesComponent implements OnInit {
  categories: Category[] = [];
  isLoading: boolean = true;
  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    dots: true,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1,
      },
      400: {
        items: 2,
      },
      740: {
        items: 3,
      },
      940: {
        items: 4,
      },
      1100: {
        items: 6,
      },
    },
    nav: false,
    lazyLoad: true,
    // rewind: true,
    margin: 10,
    // autoWidth: true,
    // Add these for better performance
    smartSpeed: 400,
    autoplay: false, // Disable autoplay to save resources
    autoplayHoverPause: true,
    // Only load visible items
    stagePadding: 0,
    rtl: true,
  };

  constructor(private readonly categoriesService: CategoriesService) {}

  ngOnInit(): void {
  //  this.getAllCategories();
    this.categoriesService.allCategories$.subscribe({
      next: (res) => {
        this.categories = res.data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
        this.isLoading = false;
      },
    });

    }

  // getAllCategories(): void {
  //   this.categoriesService.getAllCategories().subscribe({
  //     next: (res) => {
  //       this.categories = res.data;
  //       this.isLoading = false;
  //     },
  //     error: (err) => {
  //       console.error('Error fetching categories:', err);
  //       this.isLoading = false;
  //     },
  //   });
  // }
}
