import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { adminGuard } from '../../core/guards/role.guard';

export const COMPLAINTS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./complaint-list/complaint-list.component').then(m => m.ComplaintListComponent),
        title: 'Sistema de Quejas - ResidenceHub'
      },
      {
        path: 'new',
        loadComponent: () => import('./complaint-form/complaint-form.component').then(m => m.ComplaintFormComponent),
        title: 'Nueva Queja - ResidenceHub'
      },
      {
        path: ':id',
        loadComponent: () => import('./complaint-detail/complaint-detail.component').then(m => m.ComplaintDetailComponent),
        title: 'Detalle de Queja - ResidenceHub'
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./complaint-form/complaint-form.component').then(m => m.ComplaintFormComponent),
        title: 'Editar Queja - ResidenceHub'
      }
    ]
  }
];