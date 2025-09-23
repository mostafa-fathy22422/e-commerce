import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { freeGuard } from './core/guards/free-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
    title: 'home',
  },
  {
    path: 'cart',
    canActivate: [authGuard],
    loadComponent: () => import('./features/cart/cart.component').then((c) => c.CartComponent),
    title: 'cart',
  },
  {
    path: 'products',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/products/products.component').then((c) => c.ProductsComponent),
    title: 'products',
  },
  {
    path: 'categories',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/categories/categories.component').then((c) => c.CategoriesComponent),
    title: 'categories',
  },
  {
    path: 'brands',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/brands/brands.component').then((c) => c.BrandsComponent),
    title: 'brands',
  },
  {
    path: 'product-details/:id/:title',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/product-details/product-details.component').then(
        (c) => c.ProductDetailsComponent,
      ),
    title: 'product details',
  },
  {
    path: 'register',
    canActivate: [freeGuard],
    loadComponent: () =>
      import('./core/auth/register/register.component').then((c) => c.RegisterComponent),
    title: 'register',
  },
  {
    path: 'login',
    canActivate: [freeGuard],
    loadComponent: () => import('./core/auth/lgin/login.component').then((c) => c.LoginComponent),
    title: 'login',
  },
  {
    path: 'forget-password',
    canActivate: [freeGuard],
    loadComponent: () =>
      import('./core/auth/reset-password/reset-password.component').then(
        (c) => c.ResetPasswordComponent,
      ),
    title: 'forget password',
  },
  {
    path: 'checkout/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/checkout/checkout.component').then((c) => c.CheckOutComponent),
    title: 'check out',
  },
  {
    path: 'allorders',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/all-orders/all-orders.component').then((c) => c.AllOrdersComponent),
    title: 'All Order',
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then((c) => c.NotFoundComponent),
    title: 'not found',
  },
];
