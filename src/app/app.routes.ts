// =====================================================
// src/app/app.routes.ts
// =====================================================
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  // Redirect root
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  // Auth (public)
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
  },

  // Protected routes
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
  },
  {
    path: 'candidates',
    canActivate: [authGuard],
    loadChildren: () => import('./features/candidates/candidates.routes').then(m => m.CANDIDATES_ROUTES),
  },
  {
    path: 'job-offers',
    canActivate: [authGuard],
    loadChildren: () => import('./features/job-offers/job-offers.routes').then(m => m.JOB_OFFERS_ROUTES),
  },
  {
    path: 'applications',
    canActivate: [authGuard],
    loadChildren: () => import('./features/applications/applications.routes').then(m => m.APPLICATIONS_ROUTES),
  },
  {
    path: 'interviews',
    canActivate: [authGuard],
    loadChildren: () => import('./features/interviews/interviews.routes').then(m => m.INTERVIEWS_ROUTES),
  },

  // Fallback
  { path: '**', redirectTo: '/dashboard' },
];
