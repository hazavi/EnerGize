import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LoginModel } from '../../models/loginmodel';
import { Router } from '@angular/router';
import { GenericService } from '../../service/generic.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
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
        this.successMessage = 'Login successful!';
        this.errorMessage = '';
        console.log('User logged in:', response);

        // Store token or user info in localStorage/sessionStorage if needed
        localStorage.setItem('authToken', response.Token); // Assuming the API returns a token
        this.router.navigate(['/home']); // Redirect to home after login
      },
      (error: any) => {
        this.errorMessage = 'Invalid credentials or an error occurred.';
        this.successMessage = '';
        console.error('Login failed:', error);
      }
    );
  }
}
