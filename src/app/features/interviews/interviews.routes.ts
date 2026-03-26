import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const INTERVIEWS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./interview-list/interview-list').then(m => m.InterviewListComponent)
  },
  {
    path: 'new',
    canActivate: [roleGuard],
    data: { roles: ['ADMIN', 'RECRUITER'] },
    loadComponent: () => import('./interview-form/interview-form').then(m => m.InterviewFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./interview-detail/interview-detail').then(m => m.InterviewDetailComponent)
  },
  {
    path: ':id/feedback/new',
    canActivate: [roleGuard],
    data: { roles: ['ADMIN', 'RECRUITER', 'MANAGER'] },
    loadComponent: () => import('./feedback-form/feedback-form').then(m => m.FeedbackFormComponent)
  },
  {
    path: ':id/feedback',
    canActivate: [roleGuard],
    data: { roles: ['ADMIN', 'RECRUITER', 'MANAGER'] },
    loadComponent: () => import('./feedback-form/feedback-form').then(m => m.FeedbackFormComponent)
  }
];