import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, finalize, Observable, tap, throwError } from 'rxjs';
import { PasswordResponse } from '../../models/auth.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { AlertService } from '../alert.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ResetPasswordService {
  private http = inject(HttpClient);
  private readonly _apiUrl = `${environment.baseUrl}auth`;
  private readonly alertService = inject(AlertService);
  private readonly router = inject(Router);
  private stepSubject = new BehaviorSubject<number>(1);
  step = this.stepSubject.asObservable();
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();

  forgotPassword(data: { email: string }): Observable<PasswordResponse> {
    this.isLoadingSubject.next(true);
    return this.http.post<PasswordResponse>(`${this._apiUrl}/forgotPasswords`, data).pipe(
      tap((res) => {
        this.alertService.addAlert(1, res.message);
        this.stepSubject.next(2);
      }),
      catchError((err) => {
        this.alertService.addAlert(5, err.error.message || '');
        return throwError(() => err);
      }),
      finalize(() => this.isLoadingSubject.next(false)),
    );
  }

  verifyCode(data: { resetCode: string }): Observable<PasswordResponse> {
    this.isLoadingSubject.next(true);
    return this.http.post<PasswordResponse>(`${this._apiUrl}/verifyResetCode`, data).pipe(
      tap((res) => {
        this.alertService.addAlert(1, res.message);
        this.stepSubject.next(3);
      }),
      catchError((err) => {
        this.alertService.addAlert(5, err.error.message || '');
        return throwError(() => err);
      }),
      finalize(() => this.isLoadingSubject.next(false)),
    );
  }

  resetPassword(data: { email: string; newPassword: string }): Observable<PasswordResponse> {
    this.isLoadingSubject.next(true);
    return this.http.put<PasswordResponse>(`${this._apiUrl}/resetPassword`, data).pipe(
      tap((res) => {
        this.alertService.addAlert(1, res.message || 'Password reset successful');
        this.router.navigate(['/login']);
        this.stepSubject.next(1);
      }),
      catchError((err) => {
        this.alertService.addAlert(5, err.error.message || '');
        return throwError(() => err);
      }),
      finalize(() => this.isLoadingSubject.next(false)),
    );
  }
}
