import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { adminGuard } from '../../core/guards/role.guard';

export const ACTIVITIES_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./activity-calendar/activity-calendar.component').then(m => m.ActivityCalendarComponent),
        title: 'Calendario de Actividades - ResidenceHub'
      },
      {
        path: 'list',
        loadComponent: () => import('./activity-list/activity-list.component').then(m => m.ActivityListComponent),
        title: 'Lista de Actividades - ResidenceHub'
      },
      {
        path: 'new',
        canActivate: [adminGuard],
        loadComponent: () => import('./activity-form/activity-form.component').then(m => m.ActivityFormComponent),
        title: 'Nueva Actividad - ResidenceHub'
      },
      {
        path: ':id',
        loadComponent: () => import('./activity-detail/activity-detail.component').then(m => m.ActivityDetailComponent),
        title: 'Detalle de Actividad - ResidenceHub'
      },
      {
        path: ':id/edit',
        canActivate: [adminGuard],
        loadComponent: () => import('./activity-form/activity-form.component').then(m => m.ActivityFormComponent),
        title: 'Editar Actividad - ResidenceHub'
      }
    ]
  }
];