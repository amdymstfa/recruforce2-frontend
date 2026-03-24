import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const CANDIDATES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./candidate-list/candidate-list').then(m => m.CandidateListComponent)
  },
  {
    path: 'new',
    canActivate: [roleGuard],
    data: { roles: ['ADMIN', 'RECRUITER'] },
    loadComponent: () => import('./candidate-form/candidate-form').then(m => m.CandidateFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./candidate-detail/candidate-detail').then(m => m.CandidateDetailComponent)
  }
];
