// AngularApp\EchoDrop-v2\frontend-angular\src\app\services\auth.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // private API_URL = 'http://localhost:5000';
  // private API_URL = 'https://echodrop-backend.onrender.com'; // your Render URL
  private API_URL = environment.apiBaseUrl;

  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.loggedIn.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: any
  ) { }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
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

  /** 🔹 NEW: convenient admin flag decoded from JWT */
  get isAdmin(): boolean {
    if (!this.isBrowser()) return false;
    const token = this.getToken();
    if (!token) return false;

    try {
      const payloadPart = token.split('.')[1];
      const payloadJson = atob(payloadPart);   // safe because we checked isBrowser()
      const payload = JSON.parse(payloadJson);
      return !!payload.isAdmin;
    } catch (e) {
      console.error('Failed to decode JWT', e);
      return false;
    }
  }

  get currentEmail(): string | null {
    const token = this.getToken();
    if (!token || !this.isBrowser()) return null;

    try {
      const payloadPart = token.split('.')[1];
      const payloadJson = atob(payloadPart);
      const payload = JSON.parse(payloadJson);
      return payload.email || null;
    } catch {
      return null;
    }
  }

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