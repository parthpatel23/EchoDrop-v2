// AngularApp\echodrop\frontend-angular\src\app\services\auth.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common'; // ✅ Correct import

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private API_URL = 'http://localhost:5000';
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.loggedIn.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: any // ✅ Inject platformId
  ) { }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId); // ✅ Use Angular's function
  }

  private hasToken(): boolean {
    return this.isBrowser() && !!localStorage.getItem('token');
  }

  setToken(token: string) {
    if (this.isBrowser()) {
      localStorage.setItem('token', token);
      this.loggedIn.next(true);
    }
  }

  getToken(): string | null {
    return this.isBrowser() ? localStorage.getItem('token') : null;
  }

  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem('token');
      this.loggedIn.next(false);
    }
  }

  // ... rest of your methods remain the same
  signup(user: any): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/signup`, user);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/login`, credentials);
  }

  loginWithGoogle() {
    if (this.isBrowser()) {
      window.location.href = `${this.API_URL}/auth/google`;
    }
  }

  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.API_URL}/auth/me`);
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.API_URL}/auth/profile`, data);
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }
}
