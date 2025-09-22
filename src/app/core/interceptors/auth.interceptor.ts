import { inject, Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly authService = inject(AuthService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get the auth token. This method is SSR-aware.
    const authToken = this.authService.getTokenFromCookies();

    // If the token exists, clone the request and add the authorization header.
    if (authToken) {
      const authReq = req.clone({
        setHeaders: {
          token: authToken,
        },
      });
      return next.handle(authReq);
    }

    // If there's no token, pass the original request along.
    return next.handle(req);
  }
}
