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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatBadgeModule } from '@angular/material/badge';
import { ComplaintService } from '../../../core/services/complaint.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-complaint-list',
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
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatBadgeModule,
    TimeAgoPipe
  ],
  templateUrl: './complaint-list.component.html',
  styleUrls: ['./complaint-list.component.scss']
})
export class ComplaintListComponent implements OnInit {
  private complaintService = inject(ComplaintService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['asunto', 'categoria', 'prioridad', 'usuario', 'residencia', 'estado', 'fecha', 'acciones'];
  dataSource = new MatTableDataSource<any>();

  filterForm!: FormGroup;
  isLoading = true;
  totalComplaints = 0;
  pageSize = 10;
  pageIndex = 0;

  estados = [
    { value: '', label: 'Todos los estados' },
    { value: 'Nueva', label: 'Nueva' },
    { value: 'En Revisión', label: 'En Revisión' },
    { value: 'En Proceso', label: 'En Proceso' },
    { value: 'Resuelta', label: 'Resuelta' },
    { value: 'Cerrada', label: 'Cerrada' },
    { value: 'Rechazada', label: 'Rechazada' }
  ];

  categorias = [
    { value: '', label: 'Todas las categorías' },
    { value: 'Ruido', label: 'Ruido' },
    { value: 'Convivencia', label: 'Convivencia' },
    { value: 'Mascotas', label: 'Mascotas' },
    { value: 'Estacionamiento', label: 'Estacionamiento' },
    { value: 'Áreas Comunes', label: 'Áreas Comunes' },
    { value: 'Limpieza', label: 'Limpieza' },
    { value: 'Seguridad', label: 'Seguridad' },
    { value: 'Mantenimiento', label: 'Mantenimiento' },
    { value: 'Administración', label: 'Administración' },
    { value: 'Otro', label: 'Otro' }
  ];

  prioridades = [
    { value: '', label: 'Todas las prioridades' },
    { value: 'Baja', label: 'Baja' },
    { value: 'Media', label: 'Media' },
    { value: 'Alta', label: 'Alta' },
    { value: 'Urgente', label: 'Urgente' }
  ];

  ngOnInit(): void {
    this.initFilterForm();
    this.loadComplaints();
    this.setupFilterListeners();
  }

  initFilterForm(): void {
    this.filterForm = this.fb.group({
      search: [''],
      estado: [''],
      categoria: [''],
      prioridad: [''],
      fecha_inicio: [''],
      fecha_fin: ['']
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
        this.loadComplaints();
      });
  }

  loadComplaints(): void {
    this.isLoading = true;

    const filters = this.filterForm.value;
    const params: any = {
      page: this.pageIndex + 1,
      limit: this.pageSize
    };

    if (filters.estado) params.estado = filters.estado;
    if (filters.categoria) params.categoria = filters.categoria;
    if (filters.prioridad) params.prioridad = filters.prioridad;
    if (filters.search) params.search = filters.search;
    if (filters.fecha_inicio) params.fecha_inicio = filters.fecha_inicio;
    if (filters.fecha_fin) params.fecha_fin = filters.fecha_fin;

    this.complaintService.getAllComplaints(params).subscribe({
      next: (response) => {
        this.dataSource.data = response.data;
        this.totalComplaints = response.total;
        this.isLoading = false;
      },
      error: (error) => {
        this.notificationService.error('Error al cargar quejas');
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadComplaints();
  }

  clearFilters(): void {
    this.filterForm.reset({
      search: '',
      estado: '',
      categoria: '',
      prioridad: '',
      fecha_inicio: '',
      fecha_fin: ''
    });
  }

  changeStatus(
    complaint: any,
    newStatus: 'Nueva' | 'En Revisión' | 'En Proceso' | 'Resuelta' | 'Cerrada' | 'Rechazada' | undefined
  ): void {
    this.complaintService.updateComplaint(complaint.id, { estado: newStatus }).subscribe({
      next: () => {
        this.notificationService.success('Estado actualizado correctamente');
        this.loadComplaints();
      },
      error: () => {
        this.notificationService.error('Error al actualizar estado');
      }
    });
  }

  onDelete(complaint: any): void {
    if (confirm(`¿Estás seguro de eliminar la queja "${complaint.asunto}"?`)) {
      this.complaintService.deleteComplaint(complaint.id).subscribe({
        next: () => {
          this.notificationService.success('Queja eliminada correctamente');
          this.loadComplaints();
        },
        error: () => {
          this.notificationService.error('Error al eliminar queja');
        }
      });
    }
  }

  getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      'Nueva': 'status-new',
      'En Revisión': 'status-reviewed',
      'En Proceso': 'status-in-progress',
      'Resuelta': 'status-resolved',
      'Cerrada': 'status-closed',
      'Rechazada': 'status-rejected'
    };
    return statusMap[status] || 'status-default';
  }

  getStatusIcon(status: string): string {
    const iconMap: Record<string, string> = {
      'Nueva': 'fiber_new',
      'En Revisión': 'rate_review',
      'En Proceso': 'sync',
      'Resuelta': 'check_circle',
      'Cerrada': 'archive',
      'Rechazada': 'block'
    };
    return iconMap[status] || 'help_outline';
  }

  getCategoryClass(category: string): string {
    const categoryMap: Record<string, string> = {
      'Ruido': 'category-noise',
      'Convivencia': 'category-coexistence',
      'Mascotas': 'category-pets',
      'Estacionamiento': 'category-parking',
      'Áreas Comunes': 'category-common-areas',
      'Limpieza': 'category-cleaning',
      'Seguridad': 'category-security',
      'Mantenimiento': 'category-maintenance',
      'Administración': 'category-administration',
      'Otro': 'category-other'
    };
    return categoryMap[category] || 'category-default';
  }

  getCategoryIcon(category: string): string {
    const iconMap: Record<string, string> = {
      'Ruido': 'volume_up',
      'Convivencia': 'groups',
      'Mascotas': 'pets',
      'Estacionamiento': 'local_parking',
      'Áreas Comunes': 'domain',
      'Limpieza': 'cleaning_services',
      'Seguridad': 'security',
      'Mantenimiento': 'build',
      'Administración': 'admin_panel_settings',
      'Otro': 'help_outline'
    };
    return iconMap[category] || 'help_outline';
  }

  getPriorityClass(priority: string): string {
    const priorityMap: Record<string, string> = {
      'Baja': 'priority-low',
      'Media': 'priority-medium',
      'Alta': 'priority-high',
      'Urgente': 'priority-urgent'
    };
    return priorityMap[priority] || 'priority-default';
  }

  getPriorityIcon(priority: string): string {
    const iconMap: Record<string, string> = {
      'Baja': 'arrow_downward',
      'Media': 'remove',
      'Alta': 'arrow_upward',
      'Urgente': 'priority_high'
    };
    return iconMap[priority] || 'help_outline';
  }

  getUserName(complaint: any): string {
    if (complaint.es_anonima || complaint.es_anonimo) {
      return 'Usuario Anónimo';
    }
    const user = complaint.usuario || complaint.autor;
    if (!user) return 'N/A';
    return `${user.nombre} ${user.apellido}`;
  }

  getUserInitials(complaint: any): string {
    if (complaint.es_anonima || complaint.es_anonimo) {
      return 'AN';
    }
    const user = complaint.usuario || complaint.autor;
    if (!user) return '?';
    return `${user.nombre.charAt(0)}${user.apellido.charAt(0)}`.toUpperCase();
  }

  canEdit(complaint: any): boolean {
    if (!this.authService.isAdmin()) return false;
    return complaint.estado === 'Nueva';
  }

  canDelete(): boolean {
    return this.authService.isAdmin();
  }

  exportToCSV(): void {
    this.notificationService.info('Exportando a CSV...');
  }

  getNewCount(): number {
    return this.dataSource.data.filter(c => c.estado === 'Nueva').length;
  }

  getInProcessCount(): number {
    return this.dataSource.data.filter(c =>
      c.estado === 'En Revisión' || c.estado === 'En Proceso'
    ).length;
  }

  getResolvedCount(): number {
    return this.dataSource.data.filter(c => c.estado === 'Resuelta').length;
  }

  getUrgentCount(): number {
    return this.dataSource.data.filter(c => c.prioridad === 'Urgente').length;
  }
}