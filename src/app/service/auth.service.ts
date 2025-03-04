import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isLoggedIn(): boolean {
    // Check if a token exists in localStorage
    return !!localStorage.getItem('authToken');
  }

  login(token: string): void {
    // Store the token in localStorage
    localStorage.setItem('authToken', token);
  }

  logout(): void {
    // Clear the token from localStorage
    localStorage.removeItem('authToken');
  }
}
