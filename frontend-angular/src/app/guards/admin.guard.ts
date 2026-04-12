// AngularApp\EchoDrop-v2\frontend-angular\src\app\guards\admin.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const AdminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isAdmin ? true : router.parseUrl('/dashboard');
};
