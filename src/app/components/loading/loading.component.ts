import { Component } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading',
  imports: [MatProgressSpinnerModule],
  template: `
    <div class="loading-overlay">
    <div class="custom-spinner"></div>
    </div>
  `,
  styleUrls: ['./loading.component.css'],
})
export class LoadingComponent {}
