import { inject, Injectable, PLATFORM_ID, REQUEST } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { CookiesServiceHandel } from './cookies.service';
import { isPlatformServer } from '@angular/common';
import { jwtDecode } from 'jwt-decode';
import { TokenT } from '../models/auth.interface';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DecodeTokenService {
  private readonly cookieService: CookieService = inject(CookieService);
  private readonly cookiesServiceHandel: CookiesServiceHandel = inject(CookiesServiceHandel);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly req = inject(REQUEST);
  private readonly userDataSubject = new BehaviorSubject<TokenT | null>(null);
  readonly userData$ = this.userDataSubject.asObservable();
  constructor() {
    this.initializeAuthState();
  }

  getTokenFromCookies(): string | null {
    if (isPlatformServer(this.platformId)) {
      // Server-side: extract from request headers if the request object exists
      if (this.req) {
        const cookies = this.req.headers.get('cookie') || '';
        return this.cookiesServiceHandel.getCookie(cookies, 'userToken');
      }
      return null;
    } else {
      // Client-side: use CookieService
      return this.cookieService.get('userToken') || null;
    }
  }

  private initializeAuthState(): void {
    try {
      const token = this.getTokenFromCookies();
      if (token) {
        this.decodeToken(token);
      }
    } catch (error) {
      console.warn('Failed to initialize auth state:', error);
    }
  }

  private decodeToken(token: string) {
    let decoded = jwtDecode<TokenT | null>(token);
    this.userDataSubject.next(decoded);
  }
}
