import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LoginModel } from '../../../models/loginmodel';
import { Router, RouterModule } from '@angular/router';
import { GenericService } from '../../../service/generic.service';
import { CommonModule } from '@angular/common';
import { LoginResponse } from '../../../models/loginresponse';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingComponent } from '../../loading/loading.component';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatProgressSpinnerModule,
    LoadingComponent,
  ],
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
  isLoading: boolean = false; // Loading state

  constructor(
    private fb: FormBuilder,
    private genericService: GenericService<LoginModel>,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
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

    this.isLoading = true; // Start loading

    const loginData: LoginModel = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
    };

    this.genericService.login(loginData).subscribe(
      (response: any) => {
        
        if (response.token) {
          // ✅ Store the token for authentication
          localStorage.setItem('authToken', response.token);
        }

        // Map the API response to the LoginResponse interface
        this.loginResponse = {
          userId: response.user.id, // Extract user ID from the response
          username: response.user.username, // Extract username from the response
          email: response.user.email, // Extract email from the response
          role: response.role, // Extract role from the response
          token: response.token, // Extract token from the response
        };

        // Save the entire login response as JSON in localStorage
        localStorage.setItem(
          'loginResponse',
          JSON.stringify(this.loginResponse)
        );
        localStorage.setItem('isLoggedIn', 'true');

        // Show success snackbar
        const snackBarRef = this.snackBar.open(
          'You have successfully logged in!',
          '',
          {
            duration: 1500,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['success-snackbar'],
          }
        );

        // Navigate to home after snackbar is dismissed
        snackBarRef.afterDismissed().subscribe(() => {
          this.isLoading = false; // Stop loading
          this.router.navigate(['/home']).then(() => {
            window.location.reload();
          });
        });
      },
      (error: any) => {
        this.isLoading = false; // Stop loading
        this.errorMessage = 'Invalid credentials or an error occurred.';
        this.successMessage = '';
        console.error('Login failed:', error);
      }
    );
  }
}
