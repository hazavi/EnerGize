import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authTokenKey = 'authToken';
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());

  constructor() {}

  private hasToken(): boolean {
    return !!localStorage.getItem(this.authTokenKey);
  }

  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem(this.authTokenKey);
  }

  login(token: string): void {
    localStorage.setItem(this.authTokenKey, token);
    this.isLoggedInSubject.next(true);
  }

  logout(): void {
    localStorage.removeItem(this.authTokenKey);
    this.isLoggedInSubject.next(false);
  }

  getAuthStatus() {
    return this.isLoggedInSubject.asObservable();
  }
}
