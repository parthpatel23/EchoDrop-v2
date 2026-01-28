// AngularApp\echodrop\frontend-angular\src\app\guards\auth.guard.ts
// auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { isPlatformBrowser } from '@angular/common';

export const AuthGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  
  // Skip token processing on server side
  if (typeof window === 'undefined') {
    return true; // Allow server-side rendering to complete
  }

  // ✅ Capture token from Google redirect
  const token = route.queryParamMap.get('token');
  if (token) {
    console.log('Token from Google login:', token);
    auth.setToken(token);
    
    // Clean up URL without causing navigation issues
    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
    
    return true;
  }

  if (auth.isLoggedIn()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
