import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService, User, UserRole } from '../../../core/services/auth.service';
import { Observable } from 'rxjs';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  roles?: UserRole[];
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  private authService = inject(AuthService);

  currentUser$!: Observable<User | null>;
  isCollapsed = false;

  menuItems: MenuItem[] = [
    {
      icon: 'dashboard',
      label: 'Dashboard',
      route: '/dashboard'
    },
    {
      icon: 'people',
      label: 'Usuarios',
      route: '/users',
      roles: [UserRole.ADMINISTRADOR, UserRole.SUPER_ADMIN]
    },
    {
      icon: 'home',
      label: 'Residencias',
      route: '/residences'
    },
    {
      icon: 'receipt_long',
      label: 'Costos de Servicio',
      route: '/service-costs',
      roles: [UserRole.ADMINISTRADOR, UserRole.SUPER_ADMIN]
    },
    {
      icon: 'payment',
      label: 'Mis Pagos',
      route: '/payments/my-payments',
      roles: [UserRole.RESIDENTE]
    },
    {
      icon: 'payments',
      label: 'Pagos',
      route: '/payments',
      roles: [UserRole.ADMINISTRADOR, UserRole.SUPER_ADMIN]
    },
    {
      icon: 'report_problem',
      label: 'Reportes',
      route: '/reports',
      badge: 5
    },
    {
      icon: 'feedback',
      label: 'Quejas',
      route: '/complaints',
    },
    {
      icon: 'event',
      label: 'Actividades',
      route: '/activities'
    },
    {
      icon: 'pool',
      label: 'Amenidades',
      route: '/amenities'
    }
  ];

  ngOnInit(): void {
    this.currentUser$ = this.authService.currentUser$;
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  hasAccess(roles?: UserRole[]): boolean {
    if (!roles || roles.length === 0) return true;
    return this.authService.hasRole(roles);
  }
}