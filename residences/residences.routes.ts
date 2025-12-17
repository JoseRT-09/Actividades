import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { adminGuard } from '../../core/guards/role.guard';

export const RESIDENCES_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./residence-list/residence-list.component').then(m => m.ResidenceListComponent),
        title: 'Gestión de Residencias - ResidenceHub'
      },
      {
        path: 'new',
        canActivate: [adminGuard],
        loadComponent: () => import('./residence-form/residence-form.component').then(m => m.ResidenceFormComponent),
        title: 'Nueva Residencia - ResidenceHub'
      },
      {
        path: ':id',
        loadComponent: () => import('./residence-detail/residence-detail.component').then(m => m.ResidenceDetailComponent),
        title: 'Detalle de Residencia - ResidenceHub'
      },
      {
        path: ':id/edit',
        canActivate: [adminGuard],
        loadComponent: () => import('./residence-form/residence-form.component').then(m => m.ResidenceFormComponent),
        title: 'Editar Residencia - ResidenceHub'
      },
      {
        path: ':id/assign',
        canActivate: [adminGuard],
        loadComponent: () => import('./residence-assign/residence-assign.component').then(m => m.ResidenceAssignComponent),
        title: 'Asignar Residente - ResidenceHub'
      }
    ]
  }
];