import { Routes } from '@angular/router';
import { MainLayoutComponent } from './shared/layouts/main-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { dashboardGuard, adminGuard, residentGuard } from './core/guards/role.guard';

/**
 * EJEMPLO DE CONFIGURACIÓN DE RUTAS CON EL ASISTENTE VIRTUAL
 *
 * Este archivo muestra cómo configurar las rutas para que todas las vistas
 * tengan acceso al asistente virtual a través del MainLayoutComponent.
 *
 * INSTRUCCIONES:
 * 1. Copia este archivo y renómbralo a 'app.routes.ts' (o el nombre que uses)
 * 2. Ajusta las rutas según tu estructura de proyecto
 * 3. Importa este archivo en tu main.ts o app.config.ts
 */

export const routes: Routes = [
  // Ruta de autenticación (sin layout)
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES || m.default)
  },

  // Rutas principales con layout (incluye navbar, sidebar y asistente virtual)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      // Dashboard - Solo para administradores
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component')
          .then(m => m.DashboardComponent),
        canActivate: [dashboardGuard]
      },

      // Usuarios - Solo para administradores
      {
        path: 'users',
        loadChildren: () => import('./users/users.routes')
          .then(m => m.USER_ROUTES || m.default),
        canActivate: [adminGuard]
      },

      // Residencias - Solo para administradores
      {
        path: 'residences',
        loadChildren: () => import('./residences/residences.routes')
          .then(m => m.RESIDENCE_ROUTES || m.default),
        canActivate: [adminGuard]
      },

      // Pagos
      {
        path: 'payments',
        loadChildren: () => import('./payments/payments.routes')
          .then(m => m.PAYMENT_ROUTES || m.default)
      },

      // Reportes
      {
        path: 'reports',
        loadChildren: () => import('./reports/reports.routes')
          .then(m => m.REPORT_ROUTES || m.default)
      },

      // Quejas
      {
        path: 'complaints',
        loadChildren: () => import('./complaints/complaints.routes')
          .then(m => m.COMPLAINT_ROUTES || m.default)
      },

      // Actividades
      {
        path: 'activities',
        loadChildren: () => import('./activities/activities.routes')
          .then(m => m.ACTIVITY_ROUTES || m.default)
      },

      // Amenidades
      {
        path: 'amenities',
        loadChildren: () => import('./amenities/amenities.routes')
          .then(m => m.AMENITY_ROUTES || m.default)
      },

      // Redirección por defecto
      {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
      }
    ]
  },

  // Ruta 404 (sin layout)
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component')
      .then(m => m.NotFoundComponent)
  }
];

/**
 * NOTA IMPORTANTE:
 *
 * Con esta configuración, el asistente virtual estará disponible en todas
 * las rutas hijas del MainLayoutComponent, es decir:
 * - Dashboard
 * - Usuarios
 * - Residencias
 * - Pagos
 * - Reportes
 * - Quejas
 * - Actividades
 * - Amenidades
 *
 * El asistente NO aparecerá en:
 * - Rutas de autenticación (/auth/login, /auth/register)
 * - Página 404
 *
 * Si deseas que aparezca en todas las rutas (incluyendo auth), mueve
 * el <app-virtual-assistant></app-virtual-assistant> al index.html
 * o crea un componente raíz que envuelva todo.
 */
