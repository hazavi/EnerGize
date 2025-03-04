import { provideRouter, Routes } from '@angular/router';
import { ExercisesComponent } from './components/exercises/exercises.component';
import { HomeComponent } from './components/home/home.component';
import { PlansComponent } from './components/plans/plans.component';
import { ApplicationConfig } from '@angular/core';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' }, // Default redirect to home
  { path: 'home', component: HomeComponent }, // Home Page
  { path: 'exercises', component: ExercisesComponent }, // Exercises Page
  { path: 'plans', component: PlansComponent }, // Exercises Page

  { path: 'login', component: LoginComponent }, // Register Page
  { path: 'register', component: RegisterComponent }, // Register Page
];
