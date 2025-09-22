import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (authService.isAuthenticated()) {
    return true;
  }
  return router.parseUrl('/login');
  // return authService.isLoggedIn().pipe(
  //   map((isLoggedIn) => {
  //     if (isLoggedIn) {
  //       return true;
  //     } else {
  //       return router.parseUrl('/login');
  //     }
  //   })
  // );
  // return true;
  //     return authService.isAuthenticated() ? true : router.parseUrl('/login');
};
