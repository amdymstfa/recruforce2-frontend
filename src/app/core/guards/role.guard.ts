import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const required: string[] = route.data['roles'] ?? [];

  if (!auth.getToken()) return router.createUrlTree(['/auth/login']);
  if (required.length === 0) return true;
  if (required.includes(auth.currentUser()?.role ?? '')) return true;

  return router.createUrlTree(['/dashboard']);
};
