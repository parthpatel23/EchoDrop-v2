// AngularApp\echodrop\frontend-angular\src\app\auth\login\login.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service'; // ← Add this import

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  // Add AuthService to constructor ← Important!
  constructor(private http: HttpClient, private router: Router, private authService: AuthService) {}

  // Manual login
  onLogin() {
    const body = { email: this.email, password: this.password };
    this.http.post('http://localhost:5000/auth/login', body).subscribe({
      next: (res: any) => {
        // ✅ Use AuthService to set token instead of direct localStorage
        this.authService.setToken(res.token); // ← This will update the BehaviorSubject

        // Debug log to confirm
        console.log('Token saved via AuthService:', res.token);

        // ✅ Now navigate
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Login failed', err);
        alert(err.error?.msg || 'Login failed');
      }
    });
  }

  // Google login
  loginWithGoogle() {
    window.location.href = 'http://localhost:5000/auth/google';
  }
}
