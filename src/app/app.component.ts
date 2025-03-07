import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { User } from './models/user';
import { LoginResponse } from './models/loginresponse';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'EnerGize';
  isCollapsed = false;
  username: string | null = null; // Stores the username
  userId: string | null = null; // Stores the user ID
  isUserAdmin: boolean = false; // Indicates if the user is an admin
  loginResponse: LoginResponse | null = null; // Stores the parsed login response
  isProfileMenuOpen = false; // Controls submenu visibility

  constructor(private router: Router) {}

  ngOnInit() {
    this.updateProfileUI(); // Update UI based on login status
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  // Toggle profile submenu visibility
  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  // Update the UI based on login status
  updateProfileUI() {
    const loginResponse = localStorage.getItem('loginResponse');
    if (loginResponse) {
      // Parse the login response from localStorage
      this.loginResponse = JSON.parse(loginResponse);

      // Assign values to component properties
      this.username = this.loginResponse?.username || 'Profile';
      this.userId = this.loginResponse?.userId || null;

      // Check if the user is an admin
      this.isUserAdmin = this.isAdmin();
    } else {
      // Reset UI for logged-out state
      this.username = null;
      this.userId = null;
      this.isUserAdmin = false;
      this.loginResponse = null;
      this.isProfileMenuOpen = false; // Ensure submenu is closed
    }
  }

  // Check if the user is an admin
  isAdmin(): boolean {
    return this.loginResponse?.role === 'admin'; // Check the role from loginResponse
  }

  // Logout function
  logout() {
    localStorage.clear(); // Clear all localStorage data
    this.username = null;
    this.userId = null;
    this.isUserAdmin = false;
    this.loginResponse = null;
    this.isProfileMenuOpen = false; // Close submenu
    this.updateProfileUI(); // Reset UI
    this.router.navigate(['/login']).then(() => {
      window.location.reload();
    }); // Redirect to login page
  }
}