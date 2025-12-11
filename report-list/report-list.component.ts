// Frontend/src/app/presentation/reports/report-list/report-list.component.ts (CORREGIDO FINAL)
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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { ReportService, ReportListResponse } from '../../../core/services/report.service'; // Asegurar la importación del service
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-report-list',
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatBadgeModule,
    MatDividerModule,
    TimeAgoPipe 
  ],
  templateUrl: './report-list.component.html',
  styleUrls: ['./report-list.component.scss']
})
export class ReportListComponent implements OnInit {
  private reportService = inject(ReportService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['titulo', 'tipo', 'prioridad', 'residencia', 'reportado_por', 'estado', 'fecha_reporte', 'acciones'];
  dataSource = new MatTableDataSource<any>();

  filterForm!: FormGroup;
  isLoading = true;
  totalReports = 0;
  pageSize = 10;
  pageIndex = 0;

  // ✅ CORRECCIÓN: Actualizar tipos de reporte a los valores del backend
  tipos = [
    { value: '', label: 'Todos los tipos' },
    { value: 'Mantenimiento', label: 'Mantenimiento' },
    { value: 'Limpieza', label: 'Limpieza' },
    { value: 'Seguridad', label: 'Seguridad' },
    { value: 'Instalaciones', label: 'Instalaciones' },
    { value: 'Otro', label: 'Otro' }
  ];

  estados = [
    { value: '', label: 'Todos los estados' },
    { value: 'Abierto', label: 'Abierto' },
    { value: 'En Progreso', label: 'En Progreso' },
    { value: 'Resuelto', label: 'Resuelto' },
    { value: 'Cerrado', label: 'Cerrado' }
  ];

  prioridades = [
    { value: '', label: 'Todas las prioridades' },
    { value: 'Baja', label: 'Baja' },
    { value: 'Media', label: 'Media' },
    { value: 'Alta', label: 'Alta' },
    { value: 'Crítica', label: 'Crítica' }
  ];

  ngOnInit(): void {
    this.initFilterForm();
    this.loadReports();
    this.setupFilterListeners();
  }

  initFilterForm(): void {
    this.filterForm = this.fb.group({
      search: [''],
      tipo: [''],
      estado: [''],
      prioridad: [''],
      fecha_inicio: [null],
      fecha_fin: [null]
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
        this.loadReports();
      });
  }

  loadReports(): void {
    this.isLoading = true;

    const filters = this.filterForm.value;
    const params: any = {
      page: this.pageIndex + 1,
      limit: this.pageSize
    };

    if (filters.tipo) params.tipo = filters.tipo;
    if (filters.estado) params.estado = filters.estado;
    if (filters.prioridad) params.prioridad = filters.prioridad;
    if (filters.search) params.search = filters.search;
    if (filters.fecha_inicio) {
      const year = filters.fecha_inicio.getFullYear();
      const month = String(filters.fecha_inicio.getMonth() + 1).padStart(2, '0');
      const day = String(filters.fecha_inicio.getDate()).padStart(2, '0');
      params.fecha_inicio = `${year}-${month}-${day}`;
    }
    if (filters.fecha_fin) {
      const year = filters.fecha_fin.getFullYear();
      const month = String(filters.fecha_fin.getMonth() + 1).padStart(2, '0');
      const day = String(filters.fecha_fin.getDate()).padStart(2, '0');
      params.fecha_fin = `${year}-${month}-${day}`;
    }

    this.reportService.getAllReports(params).subscribe({
      next: (response) => {
        // response.data es correcto según ReportListResponse en el servicio
        this.dataSource.data = response.data;
        this.totalReports = response.total;
        this.isLoading = false;
      },
      error: (error) => {
        this.notificationService.error('Error al cargar reportes');
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadReports();
  }

  clearFilters(): void {
    this.filterForm.reset({
      search: '',
      tipo: '',
      estado: '',
      prioridad: '',
      fecha_inicio: null,
      fecha_fin: null
    });
  }

  onDelete(report: any): void {
    if (confirm(`¿Estás seguro de eliminar el reporte "${report.titulo}"?`)) {
      this.reportService.deleteReport(report.id).subscribe({
        next: () => {
          this.notificationService.success('Reporte eliminado correctamente');
          this.loadReports();
        },
        error: () => {
          this.notificationService.error('Error al eliminar reporte');
        }
      });
    }
  }

  changeStatus(report: any, newStatus: string): void {
    this.reportService.updateReport(report.id, { estado: newStatus }).subscribe({
      next: () => {
        this.notificationService.success(`Estado actualizado a: ${newStatus}`);
        this.loadReports();
      },
      error: () => {
        this.notificationService.error('Error al actualizar estado');
      }
    });
  }

  // ✅ CORRECCIÓN: Funciones de utilidad actualizadas
  getTypeClass(type: string): string {
    const typeMap: Record<string, string> = {
      'Mantenimiento': 'type-maintenance',
      'Limpieza': 'type-cleaning',
      'Seguridad': 'type-security',
      'Instalaciones': 'type-installations',
      'Otro': 'type-other'
    };
    return typeMap[type] || 'type-other';
  }

  getTypeIcon(type: string): string {
    const iconMap: Record<string, string> = {
      'Mantenimiento': 'build',
      'Limpieza': 'cleaning_services',
      'Seguridad': 'security',
      'Instalaciones': 'devices',
      'Otro': 'help_outline'
    };
    return iconMap[type] || 'help_outline';
  }

  getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      'Abierto': 'status-open',
      'En Progreso': 'status-progress',
      'Resuelto': 'status-resolved',
      'Cerrado': 'status-closed'
    };
    return statusMap[status] || 'status-default';
  }

  getStatusIcon(status: string): string {
    const iconMap: Record<string, string> = {
      'Abierto': 'error_outline',
      'En Progreso': 'sync',
      'Resuelto': 'check_circle',
      'Cerrado': 'archive'
    };
    return iconMap[status] || 'help_outline';
  }

  getPriorityClass(priority: string): string {
    const priorityMap: Record<string, string> = {
      'Baja': 'priority-low',
      'Media': 'priority-medium',
      'Alta': 'priority-high',
      'Crítica': 'priority-critical'
    };
    return priorityMap[priority] || 'priority-default';
  }

  getPriorityIcon(priority: string): string {
    const iconMap: Record<string, string> = {
      'Baja': 'arrow_downward',
      'Media': 'remove',
      'Alta': 'arrow_upward',
      'Crítica': 'priority_high'
    };
    return iconMap[priority] || 'help_outline';
  }

  getReporterName(report: any): string {
    if (report.reportadoPor) {
      return `${report.reportadoPor.nombre} ${report.reportadoPor.apellido}`;
    }
    return 'Usuario desconocido';
  }

  canEdit(report: any): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return false;

    // Admin puede editar todos
    if (this.authService.isAdmin()) return true;

    // Usar reportado_por_id, que es la columna FK real.
    return report.reportado_por_id === currentUser.id && report.estado === 'Abierto';
  }

  canDelete(): boolean {
    return this.authService.isAdmin();
  }

  exportToCSV(): void {
    this.notificationService.info('Exportando a CSV...');
  }

  getOpenCount(): number {
    return this.dataSource.data.filter(r => r.estado === 'Abierto').length;
  }

  getInProgressCount(): number {
    return this.dataSource.data.filter(r => r.estado === 'En Progreso').length;
  }

  getCriticalCount(): number {
    return this.dataSource.data.filter(r => r.prioridad === 'Crítica').length;
  }

  // Helper para obtener residencia
  getResidence(report: any) {
    return report.Residence || report.residencia;
  }

  // Helper para obtener fecha de creación
  getCreatedDate(report: any): Date | string {
    return report.created_at || new Date();
  }
}