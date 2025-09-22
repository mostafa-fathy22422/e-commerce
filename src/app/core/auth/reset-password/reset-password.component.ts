import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, Subject, switchMap, takeUntil, tap } from 'rxjs';

import { ProgressComponent } from './progress/progress.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ResetPasswordService } from '../../services/reset-password/reset-password.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, FormsModule, ProgressComponent, InputComponent, AsyncPipe],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  step$!: Observable<number>;
  forgetPasswordForm!: FormGroup;
  verifyCodeForm!: FormGroup;
  resetPasswordForm!: FormGroup;
  isLoading$!: Observable<boolean>;

  private readonly fb = inject(FormBuilder);
  private readonly resetPasswordService = inject(ResetPasswordService);
  private readonly destroy$ = new Subject<void>();

  private readonly forgetPasswordSubmit$ = new Subject<void>();
  private readonly verifyCodeSubmit$ = new Subject<void>();
  private readonly resetPasswordSubmit$ = new Subject<void>();

  ngOnInit(): void {
    this.initForms();
    this.isLoading$ = this.resetPasswordService.isLoading$;
    this.step$ = this.resetPasswordService.step;
    this.handleSubmissions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleSubmitForgetPassword(): void {
    if (this.forgetPasswordForm.invalid) {
      this.forgetPasswordForm.markAllAsTouched();
      return;
    }
    this.forgetPasswordSubmit$.next();
  }

  handleSubmitVerifyCode(): void {
    if (this.verifyCodeForm.invalid) {
      this.verifyCodeForm.markAllAsTouched();
      return;
    }
    this.verifyCodeSubmit$.next();
  }

  handleSubmitResetPassword(): void {
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }
    this.resetPasswordSubmit$.next();
  }

  private initForms(): void {
    this.forgetPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.verifyCodeForm = this.fb.group({
      resetCode: ['', [Validators.required, Validators.pattern(/^[0-9]{5,6}$/)]],
    });

    this.resetPasswordForm = this.fb.group({
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      newPassword: ['', [Validators.required, Validators.pattern(/^[A-Z][a-z@0-9]{5,10}$/)]],
    });
  }

  private handleSubmissions(): void {
    this.forgetPasswordSubmit$
      .pipe(
        switchMap(() => this.resetPasswordService.forgotPassword(this.forgetPasswordForm.value)),
        tap(() => {
          // Pre-fill the email in the final step form
          this.resetPasswordForm.patchValue({
            email: this.forgetPasswordForm.value.email,
          });
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();

    this.verifyCodeSubmit$
      .pipe(
        switchMap(() => this.resetPasswordService.verifyCode(this.verifyCodeForm.value)),
        takeUntil(this.destroy$),
      )
      .subscribe();

    this.resetPasswordSubmit$
      .pipe(
        switchMap(() =>
          this.resetPasswordService.resetPassword(this.resetPasswordForm.getRawValue()),
        ),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }
}
