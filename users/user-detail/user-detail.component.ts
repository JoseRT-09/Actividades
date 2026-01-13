 import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { GetUserByIdUseCase } from '../../../domain/use-cases/user/get-user-by-id.usecase';
import { DeleteUserUseCase } from '../../../domain/use-cases/user/delete-user.usecase';
import { User, UserRole, UserStatus } from '../../../domain/models/user.model';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';

interface ActivityLog {
  id: number;
  type: 'login' | 'update' | 'payment' | 'report' | 'activity';
  icon: string;
  color: string;
  title: string;
  description: string;
  timestamp: Date;
}

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatTabsModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatMenuModule
  ],
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss']
})
export class UserDetailComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private getUserById = inject(GetUserByIdUseCase);
  private deleteUser = inject(DeleteUserUseCase);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  user: User | null = null;
  isLoading = true;
  userId!: number;

  activityLogs: ActivityLog[] = [
    {
      id: 1,
      type: 'login',
      icon: 'login',
      color: '#667eea',
      title: 'Inicio de sesión',
      description: 'Acceso al sistema',
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      id: 2,
      type: 'payment',
      icon: 'payment',
      color: '#4caf50',
      title: 'Pago realizado',
      description: 'Pago de mantenimiento - $500',
      timestamp: new Date(Date.now() - 86400000)
    },
    {
      id: 3,
      type: 'report',
      icon: 'report_problem',
      color: '#f44336',
      title: 'Reporte creado',
      description: 'Problema eléctrico en unidad 101',
      timestamp: new Date(Date.now() - 172800000)
    }
  ];

  stats = [
    { label: 'Pagos Realizados', value: 12, icon: 'payments', color: '#4caf50' },
    { label: 'Reportes Creados', value: 3, icon: 'report', color: '#f44336' },
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.userId = +id;
      this.loadUser();
    } else {
      this.router.navigate(['/users']);
    }
  }

  loadUser(): void {
    this.isLoading = true;
    
    this.getUserById.execute(this.userId).subscribe({
      next: (user) => {
        this.user = user;
        this.isLoading = false;
      },
      error: (error) => {
        this.notificationService.error('Error al cargar usuario');
        this.router.navigate(['/users']);
        this.isLoading = false;
      }
    });
  }

  onEdit(): void {
    this.router.navigate(['/users', this.userId, 'edit']);
  }

  onDelete(): void {
    if (!this.user) return;

    const confirmed = confirm(
      `¿Estás seguro de eliminar al usuario ${this.user.nombre} ${this.user.apellido}?\n\nEsta acción no se puede deshacer.`
    );

    if (confirmed) {
      this.deleteUser.execute(this.userId).subscribe({
        next: () => {
          this.notificationService.success('Usuario eliminado correctamente');
          this.router.navigate(['/users']);
        },
        error: () => {
          this.notificationService.error('Error al eliminar usuario');
        }
      });
    }
  }

  getUserInitials(): string {
    if (!this.user) return '';
    return `${this.user.nombre.charAt(0)}${this.user.apellido.charAt(0)}`.toUpperCase();
  }

  getRoleClass(role: UserRole): string {
    const roleMap: Record<UserRole, string> = {
      [UserRole.RESIDENTE]: 'role-resident',
      [UserRole.ADMINISTRADOR]: 'role-admin',
      [UserRole.SUPER_ADMIN]: 'role-super-admin'
    };
    return roleMap[role];
  }

  getRoleIcon(role: UserRole): string {
    const iconMap: Record<UserRole, string> = {
      [UserRole.RESIDENTE]: 'person',
      [UserRole.ADMINISTRADOR]: 'admin_panel_settings',
      [UserRole.SUPER_ADMIN]: 'shield'
    };
    return iconMap[role];
  }

  getStatusClass(status: UserStatus): string {
    return status === UserStatus.ACTIVO ? 'status-active' : 'status-inactive';
  }

  getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 24) {
      return `Hace ${hours}h`;
    } else {
      return `Hace ${days}d`;
    }
  }

  canEdit(): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !this.user) return false;

    // Super Admin puede editar a todos
    if (currentUser.rol === UserRole.SUPER_ADMIN) return true;

    // Admin puede editar a residentes y a sí mismo
    if (currentUser.rol === UserRole.ADMINISTRADOR) {
      return this.user.rol === UserRole.RESIDENTE || this.user.id === currentUser.id;
    }

    // Residente solo puede editarse a sí mismo
    return this.user.id === currentUser.id;
  }

  canDelete(): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !this.user) return false;

    // No puede eliminarse a sí mismo
    if (this.user.id === currentUser.id) return false;

    // Super Admin puede eliminar a todos excepto a sí mismo
    if (currentUser.rol === UserRole.SUPER_ADMIN) return true;

    // Admin puede eliminar solo a residentes
    return currentUser.rol === UserRole.ADMINISTRADOR && this.user.rol === UserRole.RESIDENTE;
  }

  sendEmail(): void {
    if (!this.user) return;
    window.location.href = `mailto:${this.user.email}`;
  }

  callPhone(): void {
    if (!this.user?.telefono) return;
    window.location.href = `tel:${this.user.telefono}`;
  }

  printProfile(): void {
    window.print();
  }

  exportProfile(): void {
    this.notificationService.info('Exportando perfil...');
  }
}