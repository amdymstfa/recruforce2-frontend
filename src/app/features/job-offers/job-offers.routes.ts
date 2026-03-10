import { Routes } from '@angular/router';

export const JOB_OFFERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./job-offer-list/job-offer-list').then(m => m.JobOfferListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./job-offer-form/job-offer-form').then(m => m.JobOfferFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./job-offer-detail/job-offer-detail').then(m => m.JobOfferDetailComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./job-offer-form/job-offer-form').then(m => m.JobOfferFormComponent)
  }
];
