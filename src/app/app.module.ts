import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router'; // Import RouterModule
import { routes } from './app.routes'; // Import routes from app.routes.ts
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { LoginComponent } from './components/auth/login/login.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingComponent } from './components/loading/loading.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forRoot(routes),
    FormsModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    LoadingComponent
  ],
  providers: [],
  // exports: [RouterModule],
})
export class AppModule {}
