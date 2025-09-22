import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { loginData } from '../../models/auth.interface';
import { RouterLink } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

// Create custom validator functions for complex validations
export const passwordValidator = Validators.pattern(/^[A-Z][a-z@0-9]{5,10}$/);
@Component({
  selector: 'app-login',
  imports: [FormsModule, ReactiveFormsModule, RouterLink, AsyncPipe, TranslatePipe],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  isLoading!: Observable<boolean>;

  loginForm!: FormGroup;
  subscription: Subscription = new Subscription();
  private readonly authService = inject(AuthService);
  private fb = inject(FormBuilder);

  get emailController() {
    return this.loginForm?.get('email');
  }

  get passwordController() {
    return this.loginForm?.get('password');
  }

  ngOnInit(): void {
    this.initLoginForm();
    this.isLoading = this.authService.isLoading$;
  }

  initLoginForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, passwordValidator]],
    });
  }

  login(data: loginData) {
    this.subscription.unsubscribe();
    this.subscription = this.authService.login(data).subscribe();
  }

  handelSubmit() {
    if (!this.loginForm || this.loginForm.invalid) {
      this.loginForm?.markAllAsTouched();
      return;
    }
    this.login(this.loginForm.value);
  }
}
