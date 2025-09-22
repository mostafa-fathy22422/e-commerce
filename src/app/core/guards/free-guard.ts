import { CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';

export const freeGuard: CanActivateFn = (route, state) => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);
  const authService = inject(AuthService);

  if (authService.isAuthenticated()) {
    return router.parseUrl('/home');
  } else {
    return true;
  }

  // return authService.isLoggedIn() ? router.parseUrl('/home') : true;
  // return true;
};
