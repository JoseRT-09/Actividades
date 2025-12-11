import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { ActivityService } from '../../../core/services/activity.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface Activity {
  id: number;
  titulo: string;
  descripcion?: string;
  tipo?: string;
  fecha_inicio: string;
  fecha_fin?: string;
  ubicacion?: string;
  max_participantes?: number;
  estado?: string;
  organizador_id?: number;
}

@Component({
  selector: 'app-activity-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatMenuModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    TimeAgoPipe
  ],
  templateUrl: './activity-list.component.html',
  styleUrls: ['./activity-list.component.scss']
})
export class ActivityListComponent implements OnInit {

  private activityService = inject(ActivityService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  activities: Activity[] = [];
  dataSource = new MatTableDataSource<Activity>();
  displayedColumns: string[] = ['titulo', 'tipo', 'fecha_inicio', 'estado', 'acciones'];

  filterForm!: FormGroup;
  isLoading = false;
  totalActivities = 0;
  pageSize = 10;
  pageIndex = 0;

  tipos = [
    { value: '', label: 'Todos' },
    { value: 'ReuniÃ³n', label: 'ReuniÃ³n' },
    { value: 'Evento', label: 'Evento' },
    { value: 'Mantenimiento', label: 'Mantenimiento' },
    { value: 'Asamblea', label: 'Asamblea' },
    { value: 'CelebraciÃ³n', label: 'CelebraciÃ³n' },
    { value: 'Otro', label: 'Otro' }
  ];

  estados = [
    { value: '', label: 'Todos' },
    { value: 'Programada', label: 'Programada' },
    { value: 'En Curso', label: 'En Curso' },
    { value: 'Completada', label: 'Completada' },
    { value: 'Cancelada', label: 'Cancelada' }
  ];

  ngOnInit(): void {
    this.initFilterForm();
    this.loadActivities();
    this.setupFilterListeners();
  }

  initFilterForm(): void {
    this.filterForm = this.fb.group({
      search: [''],
      tipo: [''],
      estado: [''],
      fecha_inicio: [''],
      fecha_fin: ['']
    });
  }

  setupFilterListeners(): void {
    this.filterForm.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => {
        this.pageIndex = 0;
        this.loadActivities();
      });
  }

  loadActivities(): void {
    this.isLoading = true;

    const filters = this.filterForm?.value || {};
    const params: any = {
      page: this.pageIndex + 1,
      limit: this.pageSize
    };

    if (filters.tipo) params.tipo = filters.tipo;
    if (filters.estado) params.estado = filters.estado;
    if (filters.search) params.search = filters.search;

    // LOGS PARA VER EL FORMATO DE FECHAS
    if (filters.fecha_inicio) {
      console.log("ðŸ“Œ LIST: fecha_inicio cruda â†’", filters.fecha_inicio);
      params.fecha_inicio = filters.fecha_inicio;
    }

    if (filters.fecha_fin) {
      console.log("ðŸ“Œ LIST: fecha_fin cruda â†’", filters.fecha_fin);
      params.fecha_fin = filters.fecha_fin;
    }

    console.log("ðŸ“¤ LISTA enviando parÃ¡metros al backend:", params);

    this.activityService.getAllActivities(params).subscribe({
      next: (response) => {
        console.log("ðŸ“¥ LISTA respuesta backend:", response);

        this.activities = response.data || [];
        this.dataSource.data = this.activities;

        console.log(`ðŸ“Œ LISTA total actividades recibidas: ${this.activities.length}`);

        this.totalActivities = response.total || this.activities.length;

        this.isLoading = false;
      },
      error: (error) => {
        console.error('âŒ Error loading activities (LISTA):', error);

        this.activities = [];
        this.dataSource.data = [];
        this.isLoading = false;

        if (error.status === 403) {
          this.notificationService.warning('No tienes permisos para ver actividades');
        } else if (error.status !== 500) {
          this.notificationService.error('Error al cargar actividades');
        }
      }
    });
  }

  clearFilters(): void {
    this.filterForm.reset({
      search: '',
      tipo: '',
      estado: '',
      fecha_inicio: '',
      fecha_fin: ''
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadActivities();
  }

  getTypeClass(type: string): string {
    const typeMap: Record<string, string> = {
      'ReuniÃ³n': 'type-meeting',
      'Evento': 'type-event',
      'Mantenimiento': 'type-maintenance',
      'Asamblea': 'type-assembly',
      'CelebraciÃ³n': 'type-celebration',
      'Otro': 'type-other'
    };
    return typeMap[type] || 'type-default';
  }

  getTypeIcon(type: string): string {
    const iconMap: Record<string, string> = {
      'ReuniÃ³n': 'groups',
      'Evento': 'event',
      'Mantenimiento': 'build',
      'Asamblea': 'gavel',
      'CelebraciÃ³n': 'celebration',
      'Otro': 'category'
    };
    return iconMap[type] || 'help_outline';
  }

  getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      'Programada': 'status-scheduled',
      'En Curso': 'status-in-progress',
      'Completada': 'status-completed',
      'Cancelada': 'status-cancelled'
    };
    return statusMap[status] || 'status-default';
  }

  getStatusIcon(status: string): string {
    const iconMap: Record<string, string> = {
      'Programada': 'schedule',
      'En Curso': 'sync',
      'Completada': 'check_circle',
      'Cancelada': 'cancel'
    };
    return iconMap[status] || 'help_outline';
  }
}