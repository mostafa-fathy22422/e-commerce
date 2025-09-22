import { Component } from '@angular/core';
import { MainSliderComponent } from './components/main-slider/main-slider.component';
import { PopularCategoriesComponent } from './components/popular-categories/popular-categories.component';
import { PopularProductsComponent } from './components/popular-products/popular-products.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MainSliderComponent, PopularCategoriesComponent, PopularProductsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {}
