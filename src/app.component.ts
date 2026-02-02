import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, RouterModule } from '@angular/router';
import { ApiService } from './services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './app.component.html',
})
export class AppComponent {
  api = inject(ApiService);
  router = inject(Router);

  logout() {
    this.api.logout();
    this.router.navigate(['/login']);
  }
  
  // Simple check to see if we are on the login page to hide sidebar
  isLoginPage(): boolean {
    return this.router.url === '/login';
  }
}