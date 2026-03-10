import { Routes } from '@angular/router';

export const INTERVIEWS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./interview-list/interview-list').then(m => m.InterviewListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./interview-form/interview-form').then(m => m.InterviewFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./interview-detail/interview-detail').then(m => m.InterviewDetailComponent)
  }
];
