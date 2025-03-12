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
  showPassword: boolean = false; // Controls password visibility
  loginResponse: LoginResponse | null = null;
  isLoggedIn: boolean = false;
  
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

  checkLoginStatus() {
    this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (this.isLoggedIn) {
      this.router.navigate(['/home']);
    }
  }
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword; // Toggle password visibility
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
  
        // Map the API response to the LoginResponse interface
        this.loginResponse = {
          userId: response.user.id, // Extract user ID from the response
          username: response.user.username, // Extract username from the response
          email: response.user.email, // Extract email from the response
          role: response.role, // Extract role from the response
          token: response.token, // Extract token from the response
        };
  
        // Save the entire login response as JSON in localStorage
        localStorage.setItem('loginResponse', JSON.stringify(this.loginResponse));
        localStorage.setItem('isLoggedIn', 'true')

        // Navigate to home 
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
