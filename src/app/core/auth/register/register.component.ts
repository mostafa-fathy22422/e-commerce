import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { registerData } from '../../models/auth.interface';
import { InputComponent } from '../../../shared/components/input/input.component';
import { Observable, Subscription } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, InputComponent, AsyncPipe, TranslatePipe],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
  isLoading!: Observable<boolean>;
  subscription: Subscription = new Subscription();
  // !  form
  registerForm!: FormGroup;

  constructor(private authService: AuthService) {}

  get nameController(): AbstractControl {
    return this.registerForm?.get('name') as AbstractControl;
  }

  get emailController(): AbstractControl {
    return this.registerForm?.get('email') as AbstractControl;
  }

  get passwordController(): AbstractControl {
    return this.registerForm?.get('password') as AbstractControl;
  }

  get rePasswordController(): AbstractControl {
    return this.registerForm?.get('rePassword') as AbstractControl;
  }

  get phoneController(): AbstractControl {
    return this.registerForm?.get('phone') as AbstractControl;
  }

  ngOnInit(): void {
    this.initRegisterForm();
    this.isLoading = this.authService.isLoading$;
  }

  initRegisterForm() {
    this.registerForm = new FormGroup(
      {
        name: new FormControl('', [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(20),
        ]),
        email: new FormControl('', [Validators.email, Validators.required]),
        password: new FormControl('', [
          Validators.required,
          Validators.pattern(/^[A-Z][a-z@0-9]{5,10}$/),
        ]),
        rePassword: new FormControl('', [Validators.required]),
        phone: new FormControl('', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]),
      },
      { validators: this.matchPassword },
    );
  }

  register(data: registerData) {
    // this.isLoading = true;
    this.subscription.unsubscribe();
    this.subscription = this.authService.register(data).subscribe({
      next: (res) => {
        // this.isLoading = false;
        // Show success message
        // this.alertService.addAlert(1, res.message);
        //  this.router.navigate(['/home']).then(() => {
        // Optional: Add logic after navigation if needed
        // });
        // Option 2: Assign to underscore to ignore the promise (simpler)
        // this.router.navigate(['/Home']).then(_ => {});
      },
      // error: (err) => {
      //   this.isLoading = false;
      //   // Show error message
      //   this.alertService.addAlert(5, err.error?.message);
      // },
    });
  }

  handelSubmit() {
    // ! check firest ==> validation
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      // firest
      this.registerForm.setErrors({ passwordNotMatch: true });
      // this.registerForm.get('rePassword')?.patchValue('');
      return;
    }
    // how to scroll to the firest invalid
    // ! if valid ==>  send data to server
    const data: registerData = this.registerForm.value;
    this.register(this.registerForm.value);
  }

  // !                       for object==> Record<string==>key,value==>boolean>
  matchPassword(control: AbstractControl): null | Record<string, boolean> {
    const password = control.get('password')?.value;
    const rePassword = control.get('rePassword')?.value;
    if (password === rePassword) {
      return null;
    } else {
      control.get('rePassword')?.setErrors({ passwordNotMatch: true });
      return { passwordNotMatch: true };
    }
  }
}
