import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GenericService } from '../../../service/generic.service';
import { RegisterModel } from '../../../models/registermodel';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-register',
    imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private genericService: GenericService<RegisterModel>,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
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
        this.successMessage = 'Registration successful! Please log in.';
        this.errorMessage = '';
        console.log('User registered:', response);
        this.router.navigate(['/login']); // Redirect to login after registration
      },
      (error: any) => {
        this.errorMessage = 'An error occurred during registration.';
        this.successMessage = '';
        console.error('Registration failed:', error);
      }
    );
  }
}