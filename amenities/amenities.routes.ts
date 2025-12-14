import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { adminGuard } from '../../core/guards/role.guard';

export const AMENITIES_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./amenity-list/amenity-list.component').then(m => m.AmenityListComponent),
        title: 'Gestión de Amenidades - ResidenceHub'
      },
      {
        path: 'new',
        canActivate: [adminGuard],
        loadComponent: () => import('./amenity-form/amenity-form.component').then(m => m.AmenityFormComponent),
        title: 'Nueva Amenidad - ResidenceHub'
      },
      {
        path: ':id',
        loadComponent: () => import('./amenity-detail/amenity-detail.component').then(m => m.AmenityDetailComponent),
        title: 'Detalle de Amenidad - ResidenceHub'
      },
      {
        path: ':id/edit',
        canActivate: [adminGuard],
        loadComponent: () => import('./amenity-form/amenity-form.component').then(m => m.AmenityFormComponent),
        title: 'Editar Amenidad - ResidenceHub'
      },
      {
        path: ':id/booking',
        loadComponent: () => import('./amenity-booking/amenity-booking.component').then(m => m.AmenityBookingComponent),
        title: 'Reservar Amenidad - ResidenceHub'
      }
    ]
  }
];