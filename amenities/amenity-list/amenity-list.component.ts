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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { GetAllAmenitiesUseCase } from '../../../domain/use-cases/amenity/get-all-amenities.usecase';
import { DeleteAmenityUseCase } from '../../../domain/use-cases/amenity/delete-amenity.usecase';
import { UpdateAmenityUseCase } from '../../../domain/use-cases/amenity/update-amenity.usecase';
import { Amenity, AmenityType, AmenityStatus } from '../../../domain/models/amenity.model';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { FilterPipe } from '../../../shared/pipes/filter.pipe';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-amenity-list',
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
    MatSlideToggleModule,
    MatDividerModule,
    FilterPipe
  ],
  templateUrl: './amenity-list.component.html',
  styleUrls: ['./amenity-list.component.scss']
})
export class AmenityListComponent implements OnInit {
  private getAllAmenities = inject(GetAllAmenitiesUseCase);
  private deleteAmenity = inject(DeleteAmenityUseCase);
  private updateAmenity = inject(UpdateAmenityUseCase);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['nombre', 'tipo', 'capacidad', 'horario', 'costo_reserva', 'estado', 'disponible', 'acciones'];
  dataSource = new MatTableDataSource<Amenity>();
  
  filterForm!: FormGroup;
  isLoading = true;
  totalAmenities = 0;
  pageSize = 10;
  pageIndex = 0;

  tipos = [
    { value: '', label: 'Todos los tipos' },
    { value: AmenityType.SALON_EVENTOS, label: 'Salón de Eventos' },
    { value: AmenityType.GIMNASIO, label: 'Gimnasio' },
    { value: AmenityType.PISCINA, label: 'Piscina' },
    { value: AmenityType.CANCHA_DEPORTIVA, label: 'Cancha Deportiva' },
    { value: AmenityType.AREA_BBQ, label: 'Área BBQ' },
    { value: AmenityType.SALON_JUEGOS, label: 'Salón de Juegos' },
    { value: AmenityType.AREA_INFANTIL, label: 'Área Infantil' },
    { value: AmenityType.OTRO, label: 'Otro' }
  ];

  estados = [
    { value: '', label: 'Todos los estados' },
    { value: AmenityStatus.DISPONIBLE, label: 'Disponible' },
    { value: AmenityStatus.OCUPADA, label: 'Ocupada' },
    { value: AmenityStatus.MANTENIMIENTO, label: 'Mantenimiento' },
    { value: AmenityStatus.FUERA_SERVICIO, label: 'Fuera de Servicio' }
  ];

  ngOnInit(): void {
    this.initFilterForm();
    this.loadAmenities();
    this.setupFilterListeners();
  }

  initFilterForm(): void {
    this.filterForm = this.fb.group({
      search: [''],
      tipo: [''],
      estado: [''],
      disponible: ['']
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
        this.loadAmenities();
      });
  }

  loadAmenities(): void {
    this.isLoading = true;

    const filters = this.filterForm.value;
    const params: any = {
      page: this.pageIndex + 1,
      limit: this.pageSize
    };

    if (filters.tipo) params.tipo = filters.tipo;
    if (filters.estado) params.estado = filters.estado;
    if (filters.search) params.search = filters.search;
    if (filters.disponible !== '') params.disponible = filters.disponible;

    this.getAllAmenities.execute(params).subscribe({
      next: (response) => {
        this.dataSource.data = response.data;
        this.totalAmenities = response.total;
        this.isLoading = false;
      },
      error: (error) => {
        this.notificationService.error('Error al cargar amenidades');
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadAmenities();
  }

  clearFilters(): void {
    this.filterForm.reset({
      search: '',
      tipo: '',
      estado: '',
      disponible: ''
    });
  }

  onDelete(amenity: Amenity): void {
    if (confirm(`¿Estás seguro de eliminar la amenidad "${amenity.nombre}"?`)) {
      this.deleteAmenity.execute(amenity.id).subscribe({
        next: () => {
          this.notificationService.success('Amenidad eliminada correctamente');
          this.loadAmenities();
        },
        error: () => {
          this.notificationService.error('Error al eliminar amenidad');
        }
      });
    }
  }

  toggleAvailability(amenity: Amenity, event: any): void {
    event.stopPropagation();
    
    const currentStatus = amenity.disponible_reserva ?? amenity.requiere_reserva;
    const newStatus = !currentStatus;
    
    this.updateAmenity.execute(amenity.id, { disponible_reserva: newStatus }).subscribe({
      next: () => {
        this.notificationService.success(
          newStatus ? 'Amenidad habilitada para reservas' : 'Amenidad deshabilitada para reservas'
        );
        this.loadAmenities();
      },
      error: () => {
        this.notificationService.error('Error al actualizar disponibilidad');
      }
    });
  }

  getTypeClass(type: AmenityType): string {
    const typeMap: Record<AmenityType, string> = {
      [AmenityType.SALON_EVENTOS]: 'type-salon',
      [AmenityType.GIMNASIO]: 'type-gym',
      [AmenityType.PISCINA]: 'type-pool',
      [AmenityType.CANCHA_DEPORTIVA]: 'type-court',
      [AmenityType.AREA_BBQ]: 'type-bbq',
      [AmenityType.SALON_JUEGOS]: 'type-games',
      [AmenityType.AREA_INFANTIL]: 'type-kids',
      [AmenityType.OTRO]: 'type-other'
    };
    return typeMap[type];
  }

  getTypeIcon(type: AmenityType): string {
    const iconMap: Record<AmenityType, string> = {
      [AmenityType.SALON_EVENTOS]: 'event',
      [AmenityType.GIMNASIO]: 'fitness_center',
      [AmenityType.PISCINA]: 'pool',
      [AmenityType.CANCHA_DEPORTIVA]: 'sports_tennis',
      [AmenityType.AREA_BBQ]: 'outdoor_grill',
      [AmenityType.SALON_JUEGOS]: 'sports_esports',
      [AmenityType.AREA_INFANTIL]: 'child_care',
      [AmenityType.OTRO]: 'home_work'
    };
    return iconMap[type];
  }

  getStatusClass(status: AmenityStatus): string {
    const statusMap: Record<AmenityStatus, string> = {
      [AmenityStatus.DISPONIBLE]: 'status-available',
      [AmenityStatus.OCUPADA]: 'status-occupied',
      [AmenityStatus.MANTENIMIENTO]: 'status-maintenance',
      [AmenityStatus.FUERA_SERVICIO]: 'status-out-of-service'
    };
    return statusMap[status];
  }

  getStatusIcon(status: AmenityStatus): string {
    const iconMap: Record<AmenityStatus, string> = {
      [AmenityStatus.DISPONIBLE]: 'check_circle',
      [AmenityStatus.OCUPADA]: 'schedule',
      [AmenityStatus.MANTENIMIENTO]: 'build',
      [AmenityStatus.FUERA_SERVICIO]: 'cancel'
    };
    return iconMap[status];
  }

  canEdit(): boolean {
    return this.authService.isAdmin();
  }

  canDelete(): boolean {
    return this.authService.isSuperAdmin();
  }

  exportToCSV(): void {
    this.notificationService.info('Exportando a CSV...');
  }

  getAvailableCount(): number {
    return this.dataSource.data.filter(a => a.estado === AmenityStatus.DISPONIBLE).length;
  }

  getBookableCount(): number {
    return this.dataSource.data.filter(a => a.disponible_reserva ?? a.requiere_reserva).length;
  }
}