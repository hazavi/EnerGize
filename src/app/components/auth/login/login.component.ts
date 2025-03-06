import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LoginModel } from '../../../models/loginmodel';
import { Router, RouterModule } from '@angular/router';
import { GenericService } from '../../../service/generic.service';
import { CommonModule } from '@angular/common';
import { LoginResponse } from '../../../models/loginresponse';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private genericService: GenericService<LoginModel>,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    const loginData: LoginModel = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
    };

    this.genericService.login(loginData).subscribe(
      (response: any) => {
        console.log('User logged in:', response);

        // Save the entire login response as JSON in localStorage
        localStorage.setItem('loginResponse', JSON.stringify(response));

        // Navigate to home without reloading the page
        this.router.navigate(['/home']).then(() => {
          window.location.reload();
        });
      },
      (error: any) => {
        this.errorMessage = 'Invalid credentials or an error occurred.';
        this.successMessage = '';
        console.error('Login failed:', error);
      }
    );
  }
}
