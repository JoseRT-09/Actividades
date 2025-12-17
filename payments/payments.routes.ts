import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { adminGuard } from '../../core/guards/role.guard';

export const PAYMENTS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./payment-list/payment-list.component').then(m => m.PaymentListComponent),
        title: 'Gestión de Pagos - ResidenceHub'
      },
      {
        path: 'new',
        loadComponent: () => import('./payment-form/payment-form.component').then(m => m.PaymentFormComponent),
        title: 'Registrar Pago - ResidenceHub'
      },
      {
        path: ':id',
        loadComponent: () => import('./payment-detail/payment-detail.component').then(m => m.PaymentDetailComponent),
        title: 'Detalle de Pago - ResidenceHub'
      },
      {
        path: ':id/edit',
        canActivate: [adminGuard],
        loadComponent: () => import('./payment-form/payment-form.component').then(m => m.PaymentFormComponent),
        title: 'Editar Pago - ResidenceHub'
      }
    ]
  }
];