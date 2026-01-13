import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { adminGuard } from '../../core/guards/role.guard';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./user-list/user-list.component').then(m => m.UserListComponent),
        title: 'Gestión de Usuarios - ResidenceHub'
      },
      {
        path: 'new',
        loadComponent: () => import('./user-form/user-form.component').then(m => m.UserFormComponent),
        title: 'Nuevo Usuario - ResidenceHub'
      },
      {
        path: ':id',
        loadComponent: () => import('./user-detail/user-detail.component').then(m => m.UserDetailComponent),
        title: 'Detalle de Usuario - ResidenceHub'
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./user-form/user-form.component').then(m => m.UserFormComponent),
        title: 'Editar Usuario - ResidenceHub'
      }
    ]
  }
];