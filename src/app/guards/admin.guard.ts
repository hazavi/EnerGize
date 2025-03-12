import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // Retrieve user from localStorage
  const user = JSON.parse(localStorage.getItem('loginResponse') || '{}');

  // Check if the user exists and has the admin role
  if (user && user.role === 'admin') {
    return true; // Allow access
  }

  // Redirect to login if not an admin
  router.navigate(['/login']);
  return false;
};
