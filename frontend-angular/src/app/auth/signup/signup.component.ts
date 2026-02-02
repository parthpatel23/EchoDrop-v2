// AngularApp\echodrop\frontend-angular\src\app\auth\signup\signup.component.ts
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  password: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  private API_URL = 'https://echodrop-backend.onrender.com'; // your Render backend URL

  // Manual signup
onSignup() {
  const body = {
    firstName: this.firstName,
    lastName: this.lastName,
    email: this.email,
    password: this.password
  };

  this.http.post(`${this.API_URL}/auth/signup`, body).subscribe({
    next: (res: any) => {
      alert(res.msg || "Signup successful! Please login.");
      this.router.navigate(['/login']); // ✅ redirect to login page
    },
    error: (err) => {
      console.error('Signup failed', err);
      alert(err.error?.msg || 'Signup failed');
    }
  });
}

  // Google signup
  signupWithGoogle() {
    window.location.href = `${this.API_URL}/auth/google`;
  }
}
