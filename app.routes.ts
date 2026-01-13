// Frontend/src/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./presentation/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./presentation/dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'Dashboard - ResidenceHub'
  },
  {
    path: 'users',
    canActivate: [authGuard],
    loadChildren: () => import('./presentation/users/users.routes').then(m => m.USERS_ROUTES)
  },
  {
    path: 'residences',
    canActivate: [authGuard],
    loadChildren: () => import('./presentation/residences/residences.routes').then(m => m.RESIDENCES_ROUTES)
  },
  // RUTAS COMENTADAS HASTA QUE ESTÉN IMPLEMENTADAS
  // {
  //   path: 'service-costs',
  //   canActivate: [authGuard],
  //   loadChildren: () => import('./presentation/service-costs/service-costs.routes').then(m => m.SERVICE_COSTS_ROUTES)
  // },
  {
    path: 'payments',
    canActivate: [authGuard],
    loadChildren: () => import('./presentation/payments/payments.routes').then(m => m.PAYMENTS_ROUTES)
  },
  {
    path: 'reports',
    canActivate: [authGuard],
    loadChildren: () => import('./presentation/reports/reports.routes').then(m => m.REPORTS_ROUTES)
  },
  {
    path: 'complaints',
    canActivate: [authGuard],
    loadChildren: () => import('./presentation/complaints/complaints.routes').then(m => m.COMPLAINTS_ROUTES)
  },
  {
    path: 'activities',
    canActivate: [authGuard],
    loadChildren: () => import('./presentation/activities/activities.routes').then(m => m.ACTIVITIES_ROUTES)
  },
  {
    path: 'amenities',
    canActivate: [authGuard],
    loadChildren: () => import('./presentation/amenities/amenities.routes').then(m => m.AMENITIES_ROUTES)
  },
  // {
  //   path: 'profile',
  //   canActivate: [authGuard],
  //   loadComponent: () => import('./presentation/profile/profile.component').then(m => m.ProfileComponent),
  //   title: 'Mi Perfil - ResidenceHub'
  // },
  // {
  //   path: 'unauthorized',
  //   loadComponent: () => import('./presentation/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent),
  //   title: 'Acceso Denegado - ResidenceHub'
  // },
  {
    path: '**',
    redirectTo: 'dashboard' 
  }
];