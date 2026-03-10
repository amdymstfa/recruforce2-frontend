import { Routes } from '@angular/router';

export const CANDIDATES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./candidate-profile/candidate-profile').then(m => m.CandidateProfileComponent)
  },
  {
    path: ':id/cv',
    loadComponent: () => import('./candidate-cv/candidate-cv').then(m => m.CandidateCvComponent)
  }
];
