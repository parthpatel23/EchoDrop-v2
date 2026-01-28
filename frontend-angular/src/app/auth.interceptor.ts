// AngularApp\echodrop\frontend-angular\src\app\auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  // Safe: read token directly from localStorage (no inject(AuthService) to avoid circular deps)
  const token = (typeof window !== 'undefined') ? localStorage.getItem('token') : null;

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  return next(req);
};
