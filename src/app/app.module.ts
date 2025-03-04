import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router'; // Import RouterModule
import { routes } from './app.routes'; // Import routes from app.routes.ts
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { LoginComponent } from './components/login/login.component';
@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes), FormsModule],
  providers: [],
  // exports: [RouterModule],
})
export class AppModule {}