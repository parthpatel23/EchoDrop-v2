// AngularApp\echodrop\frontend-angular\src\app\auth\login\login.component.ts
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../shared/toast.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {}

  // Manual login via AuthService (uses BACKEND_URL from AuthService)
  onLogin() {
    const body = { email: this.email, password: this.password };

    this.authService.login(body).subscribe({
      next: (res: any) => {
        // Save token via AuthService (also updates navbar, guards, etc.)
        this.authService.setToken(res.token);
        console.log('Token saved via AuthService:', res.token);

        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Login failed', err);
        // alert(err.error?.msg || 'Login failed');
        this.toast.error(err.error?.msg || 'Login failed');
      }
    });
  }

  // Google login via AuthService
  loginWithGoogle() {
    this.authService.loginWithGoogle();
  }
}