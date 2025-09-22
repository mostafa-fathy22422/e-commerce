// auth.service.ts
import { inject, Injectable, PLATFORM_ID, REQUEST } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { loginData, registerData, TokenT, userData } from '../../models/auth.interface';
import { BehaviorSubject, catchError, finalize, map, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { isPlatformServer } from '@angular/common';
import { CookiesServiceHandel } from '../cookies.service';
import { AlertService } from '../alert.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly router: Router = inject(Router);
  private readonly cookieService: CookieService = inject(CookieService);
  private readonly cookiesServiceHandel: CookiesServiceHandel = inject(CookiesServiceHandel);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly req = inject(REQUEST);
  private readonly alertService = inject(AlertService);

  private readonly _apiUrl = `${environment.baseUrl}auth`;

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();
  private readonly userDataSubject = new BehaviorSubject<TokenT | null>(null);
  readonly userData$ = this.userDataSubject.asObservable();

  private isLoggedIn$ = this.userData$.pipe(map((user) => !!user));

  constructor() {
    this.initializeAuthState();
  }

  /**
   * Gets the auth token from cookies, handling both server-side and client-side rendering.
   */
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

  register(data: registerData): Observable<userData> {
    this.isLoadingSubject.next(true);
    return this.http.post<userData>(`${this._apiUrl}/signup`, data).pipe(
      tap((res) => {
        if (res.token) {
          this.handleSuccessfulAuth(res.token);
        }
        this.router.navigate(['/home']);
        this.alertService.addAlert(1, res.message);
      }),
      catchError((err) => {
        this.alertService.addAlert(5, err.error?.message);
        return throwError(() => err);
      }),
      finalize(() => this.isLoadingSubject.next(false)),
    );
  }

  login(data: loginData): Observable<userData> {
    this.isLoadingSubject.next(true);
    return this.http.post<userData>(`${this._apiUrl}/signin`, data).pipe(
      tap((res) => {
        if (res.token) {
          this.handleSuccessfulAuth(res.token);
          this.router.navigate(['/home']);
          this.alertService.addAlert(1, res.message);
        }
      }),
      catchError((err) => {
        this.alertService.addAlert(5, err.error?.message);
        return throwError(() => err);
      }),
      finalize(() => this.isLoadingSubject.next(false)),
    );
  }

  logout(): void {
    this.cookieService.delete('userToken');
    this.userDataSubject.next(null);
    this.router.navigate(['/login']).then(() => {});
  }

  //! Add helper methods for route guards
  isAuthenticated(): boolean {
    return !!this.userDataSubject.value;
  }

  isLoggedIn(): Observable<boolean> {
    return this.isLoggedIn$;
  }

  getUserRole(): string | null {
    return this.userDataSubject.value?.role || null;
  }

  private initializeAuthState(): void {
    try {
      const token = this.getTokenFromCookies();
      if (token) {
        this.decodeToken(token);
      }
    } catch (error) {
      console.warn('Failed to initialize auth state:', error);
      this.logout();
    }
  }

  private decodeToken(token: string) {
    const decoded = jwtDecode<TokenT | null>(token);
    this.userDataSubject.next(decoded);
  }

  private handleSuccessfulAuth(token: string) {
    this.cookieService.set('userToken', token);
    this.decodeToken(token);
  }
}
