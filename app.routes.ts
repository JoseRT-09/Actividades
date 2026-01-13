// Frontend/src/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './presentation/layouts/main-layout.component';

export const routes: Routes = [
  // Rutas de autenticación (sin layout ni asistente virtual)
  {
    path: 'auth',
    loadChildren: () => import('./presentation/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  // Rutas principales con layout (incluye navbar, sidebar y asistente virtual)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./presentation/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Dashboard - ResidenceHub'
      },
      {
        path: 'users',
        loadChildren: () => import('./presentation/users/users.routes').then(m => m.USERS_ROUTES)
      },
      {
        path: 'residences',
        loadChildren: () => import('./presentation/residences/residences.routes').then(m => m.RESIDENCES_ROUTES)
      },
      {
        path: 'payments',
        loadChildren: () => import('./presentation/payments/payments.routes').then(m => m.PAYMENTS_ROUTES)
      },
      {
        path: 'reports',
        loadChildren: () => import('./presentation/reports/reports.routes').then(m => m.REPORTS_ROUTES)
      },
      {
        path: 'complaints',
        loadChildren: () => import('./presentation/complaints/complaints.routes').then(m => m.COMPLAINTS_ROUTES)
      },
      {
        path: 'activities',
        loadChildren: () => import('./presentation/activities/activities.routes').then(m => m.ACTIVITIES_ROUTES)
      },
      {
        path: 'amenities',
        loadChildren: () => import('./presentation/amenities/amenities.routes').then(m => m.AMENITIES_ROUTES)
      }
    ]
  },

  // Redirección por defecto
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];