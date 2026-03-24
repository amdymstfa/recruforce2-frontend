import { Routes } from '@angular/router';

export const PUBLIC_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./apply-list/apply-list').then(m => m.ApplyListComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./apply-form/apply-form').then(m => m.ApplyFormComponent)
  }
];
