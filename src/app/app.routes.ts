import { provideRouter, Routes } from '@angular/router';
import { ExercisesComponent } from './components/exercises/exercises.component';
import { HomeComponent } from './components/home/home.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { LoginComponent } from './components/auth/login/login.component';
import { AdminComponent } from './components/auth/admin/admin.component';
import { adminGuard } from './guards/admin.guard';
import { WorkoutComponent } from './components/workout/workout.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' }, // Default redirect to home
  { path: 'home', component: HomeComponent }, // Home Page
  { path: 'exercises', component: ExercisesComponent }, // Exercises Page
  { path: 'workout', component: WorkoutComponent }, // Workout Page

  { path: 'login', component: LoginComponent }, // Register Page
  { path: 'register', component: RegisterComponent }, // Register Page
  { path: 'admin', component: AdminComponent, canActivate: [adminGuard] }, // Admin Page
];
