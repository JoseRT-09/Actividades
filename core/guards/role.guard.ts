import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService, UserRole } from '../services/auth.service';

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
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

    router.navigate(['/unauthorized']);
    return false;
  };
};

export const adminGuard: CanActivateFn = roleGuard([
  UserRole.ADMINISTRADOR,
  UserRole.SUPER_ADMIN
]);

export const superAdminGuard: CanActivateFn = roleGuard([
  UserRole.SUPER_ADMIN
]);

export const residentGuard: CanActivateFn = roleGuard([
  UserRole.RESIDENTE
]);