import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { adminGuard } from '../../core/guards/role.guard';

export const REPORTS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./report-list/report-list.component').then(m => m.ReportListComponent),
        title: 'Gestión de Reportes - ResidenceHub'
      },
      {
        path: 'new',
        loadComponent: () => import('./report-form/report-form.component').then(m => m.ReportFormComponent),
        title: 'Nuevo Reporte - ResidenceHub'
      },
      {
        path: ':id',
        loadComponent: () => import('./report-detail/report-detail.component').then(m => m.ReportDetailComponent),
        title: 'Detalle de Reporte - ResidenceHub'
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./report-form/report-form.component').then(m => m.ReportFormComponent),
        title: 'Editar Reporte - ResidenceHub'
      }
    ]
  }
];