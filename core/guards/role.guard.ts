import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService, UserRole } from '../services/auth.service';

export const roleGuard = (allowedRoles: UserRole[], redirectUrl?: string): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      router.navigate(['/auth/login']);
      return false;
    }

    if (authService.hasRole(allowedRoles)) {
      return true;
    }

    // Si es residente y hay una URL de redirección específica, redirigir ahí
    if (authService.hasRole([UserRole.RESIDENTE]) && redirectUrl) {
      router.navigate([redirectUrl]);
      return false;
    }

    router.navigate(['/unauthorized']);
    return false;
  };
};

export const adminGuard: CanActivateFn = roleGuard([
  UserRole.ADMINISTRADOR,
  UserRole.SUPER_ADMIN
]);

export const dashboardGuard: CanActivateFn = roleGuard(
  [UserRole.ADMINISTRADOR, UserRole.SUPER_ADMIN],
  '/payments/my-payments'
);

export const superAdminGuard: CanActivateFn = roleGuard([
  UserRole.SUPER_ADMIN
]);

export const residentGuard: CanActivateFn = roleGuard([
  UserRole.RESIDENTE
]);