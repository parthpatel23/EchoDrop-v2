// AngularApp\echodrop\frontend-angular\src\app\auth\signup\signup.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule], // ✅ needed
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  password: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  // Manual signup
onSignup() {
  const body = {
    firstName: this.firstName,
    lastName: this.lastName,
    email: this.email,
    password: this.password
  };

  this.http.post('http://localhost:5000/auth/signup', body).subscribe({
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
    window.location.href = 'http://localhost:5000/auth/google';
  }
}
