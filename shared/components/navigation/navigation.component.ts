import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AuthService, User, UserRole } from '../../../core/services/auth.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles?: UserRole[];
  children?: MenuItem[];
}

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule
  ],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {
  private breakpointObserver = inject(BreakpointObserver);
  private authService = inject(AuthService);

  currentUser$!: Observable<User | null>;
  currentUser: User | null = null;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard'
    },
    {
      label: 'Mi Residencia',
      icon: 'home',
      route: '/residences/my-residence',
      roles: [UserRole.RESIDENTE]
    },
    {
      label: 'Residencias',
      icon: 'apartment',
      route: '/residences',
      roles: [UserRole.ADMINISTRADOR, UserRole.SUPER_ADMIN]
    },
    {
      label: 'Actividades',
      icon: 'event',
      route: '/activities'
    },
    {
      label: 'Amenidades',
      icon: 'pool',
      route: '/amenities'
    },
    {
      label: 'Mis Reservaciones',
      icon: 'book_online',
      route: '/amenities/my-reservations',
      roles: [UserRole.RESIDENTE]
    },
    {
      label: 'Gestión de Reservaciones',
      icon: 'admin_panel_settings',
      route: '/amenities/reservations',
      roles: [UserRole.ADMINISTRADOR, UserRole.SUPER_ADMIN]
    },
    {
      label: 'Reportes',
      icon: 'report',
      route: '/reports'
    },
    {
      label: 'Quejas',
      icon: 'feedback',
      route: '/complaints'
    },
    // Sección de Pagos
    {
      label: 'Mis Pagos',
      icon: 'payment',
      route: '/payments/my-payments',
      roles: [UserRole.RESIDENTE]
    },
    {
      label: 'Gestión de Pagos',
      icon: 'account_balance_wallet',
      route: '/payments',
      roles: [UserRole.ADMINISTRADOR, UserRole.SUPER_ADMIN]
    }
  ];

  ngOnInit(): void {
    this.currentUser$ = this.authService.currentUser$;
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  hasAccess(roles?: UserRole[]): boolean {
    if (!roles || roles.length === 0) return true;
    return this.authService.hasRole(roles);
  }

  getVisibleMenuItems(): MenuItem[] {
    return this.menuItems.filter(item => this.hasAccess(item.roles));
  }

  logout(): void {
    this.authService.logout();
  }

  getUserRoleName(): string {
    if (!this.currentUser) return '';

    const roleNames: Record<UserRole, string> = {
      [UserRole.RESIDENTE]: 'Residente',
      [UserRole.ADMINISTRADOR]: 'Administrador',
      [UserRole.SUPER_ADMIN]: 'Super Administrador'
    };

    return roleNames[this.currentUser.rol] || this.currentUser.rol;
  }
}
