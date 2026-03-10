import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  // Redirect
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },

  // Auth (public)
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then(m => m.RegisterComponent)
  },

  // Dashboard (protected)
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/dashboard/dashboard/dashboard').then(m => m.DashboardComponent)
  },

  // Applications (protected)
  {
    path: 'applications',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/applications/applications.routes').then(m => m.APPLICATIONS_ROUTES)
  },

  // Candidates (protected)
  {
    path: 'candidates',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/candidates/candidates.routes').then(m => m.CANDIDATES_ROUTES)
  },

  // Job Offers (protected)
  {
    path: 'job-offers',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/job-offers/job-offers.routes').then(m => m.JOB_OFFERS_ROUTES)
  },

  // Interviews (protected)
  {
    path: 'interviews',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/interviews/interviews.routes').then(m => m.INTERVIEWS_ROUTES)
  },

  // 404
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
