import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';

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

  constructor(private router: Router) {}

  ngOnInit() {
    this.updateProfileUI();
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  // Update the UI based on login status
  updateProfileUI() {
    const profileText = document.getElementById('profile-text');
    const profileSubmenu = document.getElementById('profile-submenu');

    const loginResponse = localStorage.getItem('loginResponse');
    if (loginResponse) {
      const userData = JSON.parse(loginResponse);
      const username = userData.user?.username || 'Profile'; // Access the username from the user object
      profileText!.textContent = username;

      // Show submenu on profile click
      document.getElementById('profile-link')!.addEventListener('click', () => {
        profileSubmenu!.style.display =
          profileSubmenu!.style.display === 'block' ? 'none' : 'block';
      });

      // Handle logout
      document.getElementById('logout-btn')!.addEventListener('click', () => {
        this.logout();
      });
    } else {
      profileText!.textContent = 'Login'; // Default to "Login"
      profileSubmenu!.style.display = 'none'; // Hide submenu
    }
  }

  // Logout function
  logout() {
    localStorage.clear(); // Clear all localStorage data
    this.updateProfileUI(); // Reset UI
    this.router.navigate(['/login']).then(() => {
      window.location.reload();
    }); // Redirect to login page
  }
}
