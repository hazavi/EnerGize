import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private snackBar: MatSnackBar) {}

  /**
   * Show a notification snackbar
   * @param message The message to display
   * @param action Optional action button text
   * @param duration Duration in milliseconds
   * @param type Type of message: 'success', 'error', 'warning', 'info', or 'default'
   */
  showNotification(
    message: string,
    action: string = '',
    duration: number = 3000,
    type: 'success' | 'error' | 'warning' | 'info' | 'default' = 'default'
  ): void {
    this.snackBar.open(message, action, {
      duration: duration,
      verticalPosition: 'top',
      horizontalPosition: 'center',
      panelClass: [`${type}-snackbar`],
    });
  }

  success(message: string, action: string = '', duration: number = 3000): void {
    this.showNotification(message, action, duration, 'success');
  }

  error(message: string, action: string = '', duration: number = 4000): void {
    this.showNotification(message, action, duration, 'error');
  }

  warning(message: string, action: string = '', duration: number = 3500): void {
    this.showNotification(message, action, duration, 'warning');
  }

  info(message: string, action: string = '', duration: number = 3000): void {
    this.showNotification(message, action, duration, 'info');
  }
}
