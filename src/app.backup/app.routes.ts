import { Routes } from '@angular/router';
import { AuthGuard } from '@core/auth/guards/auth.guard';
import { RoleGuard } from '@core/auth/guards/role.guard';

export const routes: Routes = [
  // Default redirect
  {
    path: '',
    redirectTo: '/jobs',
    pathMatch: 'full'
  },

  // Public routes
  {
    path: 'jobs',
    loadComponent: () => import('./features/public/job-board/job-board.component')
      .then(m => m.JobBoardComponent),
    title: 'Job Offers - RecruForce2'
  },
  {
    path: 'jobs/:id',
    loadComponent: () => import('./features/public/job-detail/job-detail.component')
      .then(m => m.JobDetailComponent),
    title: 'Job Detail - RecruForce2'
  },
  {
    path: 'jobs/:id/apply',
    loadComponent: () => import('./features/public/apply/apply.component')
      .then(m => m.ApplyComponent),
    title: 'Apply - RecruForce2'
  },

  // Auth routes
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component')
      .then(m => m.LoginComponent),
    title: 'Login - RecruForce2'
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component')
      .then(m => m.RegisterComponent),
    title: 'Register - RecruForce2'
  },

  // Protected routes
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
    title: 'Dashboard - RecruForce2'
  },

  // Candidates module (RECRUITER, ADMIN only)
  {
    path: 'candidates',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['RECRUITER', 'ADMIN'] },
    loadChildren: () => import('./features/candidates/candidates.routes')
      .then(m => m.CANDIDATES_ROUTES)
  },

  // Job Offers module (RECRUITER, ADMIN only)
  {
    path: 'job-offers',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['RECRUITER', 'ADMIN'] },
    loadChildren: () => import('./features/job-offers/job-offers.routes')
      .then(m => m.JOB_OFFERS_ROUTES)
  },

  // Applications module (RECRUITER, MANAGER, ADMIN)
  {
    path: 'applications',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['RECRUITER', 'MANAGER', 'ADMIN'] },
    loadChildren: () => import('./features/applications/applications.routes')
      .then(m => m.APPLICATIONS_ROUTES)
  },

  // Interviews module (RECRUITER, MANAGER, ADMIN)
  {
    path: 'interviews',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['RECRUITER', 'MANAGER', 'ADMIN'] },
    loadChildren: () => import('./features/interviews/interviews.routes')
      .then(m => m.INTERVIEWS_ROUTES)
  },

  // 404 Not Found
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component')
      .then(m => m.NotFoundComponent),
    title: 'Page Not Found - RecruForce2'
  }
];