import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'auth', loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES) },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./core/layout/main-layout/main-layout').then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
      },
      {
        path: 'candidates',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'RECRUITER', 'MANAGER'] },
        loadChildren: () => import('./features/candidates/candidates.routes').then(m => m.CANDIDATES_ROUTES)
      },
      {
        path: 'job-offers',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'RECRUITER'] },
        loadChildren: () => import('./features/job-offers/job-offers.routes').then(m => m.JOB_OFFERS_ROUTES)
      },
      {
        path: 'applications',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'RECRUITER'] },
        loadChildren: () => import('./features/applications/applications.routes').then(m => m.APPLICATIONS_ROUTES)
      },
      {
        path: 'interviews',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'RECRUITER', 'MANAGER'] },
        loadChildren: () => import('./features/interviews/interviews.routes').then(m => m.INTERVIEWS_ROUTES)
      },
      {
        path: 'admin',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
      },
    ]
  },
  {
    path: 'apply',
    loadChildren: () => import('./features/public/public.routes').then(m => m.PUBLIC_ROUTES)
  },
  { path: '**', redirectTo: '/dashboard' }
];
