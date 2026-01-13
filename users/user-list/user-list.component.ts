import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GetAllUsersUseCase } from '../../../domain/use-cases/user/get-all-users.usecase';
import { DeleteUserUseCase } from '../../../domain/use-cases/user/delete-user.usecase';
import { User, UserRole, UserStatus } from '../../../domain/models/user.model';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FilterPipe } from '@shared/pipes/filter.pipe';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatMenuModule,
    MatDialogModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    FilterPipe
  ],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  private getAllUsers = inject(GetAllUsersUseCase);
  private deleteUser = inject(DeleteUserUseCase);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['avatar', 'nombre', 'email', 'telefono', 'rol', 'estado', 'fecha_registro', 'acciones'];
  dataSource = new MatTableDataSource<User>();
  
  filterForm!: FormGroup;
  isLoading = true;
  totalUsers = 0;
  pageSize = 10;
  pageIndex = 0;

  roles = [
    { value: '', label: 'Todos los roles' },
    { value: UserRole.RESIDENTE, label: 'Residente' },
    { value: UserRole.ADMINISTRADOR, label: 'Administrador' },
    { value: UserRole.SUPER_ADMIN, label: 'Super Admin' }
  ];

  estados = [
    { value: '', label: 'Todos los estados' },
    { value: UserStatus.ACTIVO, label: 'Activo' },
    { value: UserStatus.INACTIVO, label: 'Inactivo' }
  ];

  ngOnInit(): void {
    this.initFilterForm();
    this.loadUsers();
    this.setupFilterListeners();
  }

  initFilterForm(): void {
    this.filterForm = this.fb.group({
      search: [''],
      rol: [''],
      estado: ['']
    });
  }

  setupFilterListeners(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.pageIndex = 0;
        this.loadUsers();
      });
  }

  loadUsers(): void {
    this.isLoading = true;

    const filters = this.filterForm.value;
    const params: any = {
      page: this.pageIndex + 1,
      limit: this.pageSize
    };

    if (filters.rol) params.rol = filters.rol;
    if (filters.estado) params.estado = filters.estado;
    if (filters.search) params.search = filters.search;

    this.getAllUsers.execute(params).subscribe({
      next: (response) => {
        this.dataSource.data = response.data;
        this.totalUsers = response.total;
        this.isLoading = false;
      },
      error: (error) => {
        this.notificationService.error('Error al cargar usuarios');
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadUsers();
  }

  clearFilters(): void {
    this.filterForm.reset({
      search: '',
      rol: '',
      estado: ''
    });
  }

  onDelete(user: User): void {
    if (confirm(`¿Estás seguro de eliminar al usuario ${user.nombre} ${user.apellido}?`)) {
      this.deleteUser.execute(user.id).subscribe({
        next: () => {
          this.notificationService.success('Usuario eliminado correctamente');
          this.loadUsers();
        },
        error: () => {
          this.notificationService.error('Error al eliminar usuario');
        }
      });
    }
  }

  getUserInitials(user: User): string {
    return `${user.nombre.charAt(0)}${user.apellido.charAt(0)}`.toUpperCase();
  }

  getRoleClass(role: UserRole): string {
    const roleMap: Record<UserRole, string> = {
      [UserRole.RESIDENTE]: 'role-resident',
      [UserRole.ADMINISTRADOR]: 'role-admin',
      [UserRole.SUPER_ADMIN]: 'role-super-admin'
    };
    return roleMap[role];
  }

  getStatusClass(status: UserStatus): string {
    return status === UserStatus.ACTIVO ? 'status-active' : 'status-inactive';
  }

  canEdit(user: User): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return false;

    // Super Admin puede editar a todos
    if (currentUser.rol === UserRole.SUPER_ADMIN) return true;

    // Admin puede editar a residentes y a sí mismo
    if (currentUser.rol === UserRole.ADMINISTRADOR) {
      return user.rol === UserRole.RESIDENTE || user.id === currentUser.id;
    }

    // Residente solo puede editarse a sí mismo
    return user.id === currentUser.id;
  }

  canDelete(user: User): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return false;

    // No puede eliminarse a sí mismo
    if (user.id === currentUser.id) return false;

    // Super Admin puede eliminar a todos excepto a sí mismo
    if (currentUser.rol === UserRole.SUPER_ADMIN) return true;

    // Admin puede eliminar solo a residentes
    return currentUser.rol === UserRole.ADMINISTRADOR && user.rol === UserRole.RESIDENTE;
  }

  exportToCSV(): void {
    // Implementar exportación a CSV
    this.notificationService.info('Exportando a CSV...');
  }
}