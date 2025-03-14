import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { GenericService } from '../../../service/generic.service';
import { RegisterModel } from '../../../models/registermodel';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  showPassword: boolean = false; // Controls password visibility

  constructor(
    private fb: FormBuilder,
    private genericService: GenericService<RegisterModel>,
    private router: Router,
    private snackBar: MatSnackBar

  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword; // Toggle password visibility
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      return;
    }

    const registerData: RegisterModel = {
      username: this.registerForm.value.username,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
    };

    this.genericService.register(registerData).subscribe(
      (response: any) => {
        this.errorMessage = '';
        // Show success snackbar
        const snackBarRef = this.snackBar.open(
          'Registered successfully!',
          '',
          {
            duration: 1500,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['success-snackbar'],
          }
        );
        snackBarRef.afterDismissed().subscribe(() => {
          this.router.navigate(['/login']).then(() => {
            window.location.reload();
          });
        });    
      },
      (error: any) => {
        this.errorMessage = 'An error occurred during registration.';
        this.successMessage = '';
        console.error('Registration failed:', error);
      }
    );
  }
}
