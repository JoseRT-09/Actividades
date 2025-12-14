import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AmenityApiRepository } from '../../../data/repositories/amenity-api.repository';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { AmenityReservation, ReservationStatus } from '../../../domain/models/amenity.model';
import { ApproveRejectDialogComponent } from './approve-reject-dialog/approve-reject-dialog.component';

@Component({
  selector: 'app-amenity-reservations',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatTooltipModule
  ],
  templateUrl: './amenity-reservations.component.html',
  styleUrls: ['./amenity-reservations.component.scss']
})
export class AmenityReservationsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private amenityRepository = inject(AmenityApiRepository);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  ReservationStatus = ReservationStatus;

  filterForm!: FormGroup;
  reservations: AmenityReservation[] = [];
  isLoading = false;
  totalReservations = 0;
  pageSize = 10;
  pageIndex = 0;

  displayedColumns: string[] = [
    'id',
    'amenidad',
    'residente',
    'fecha_reserva',
    'horario',
    'num_personas',
    'estado',
    'acciones'
  ];

  estados = [
    { value: '', label: 'Todos los estados' },
    { value: ReservationStatus.PENDIENTE, label: 'Pendiente' },
    { value: ReservationStatus.CONFIRMADA, label: 'Confirmada' },
    { value: ReservationStatus.CANCELADA, label: 'Cancelada' },
    { value: ReservationStatus.COMPLETADA, label: 'Completada' }
  ];

  ngOnInit(): void {
    this.initFilterForm();
    this.loadReservations();
    this.setupFilterListeners();
  }

  initFilterForm(): void {
    this.filterForm = this.fb.group({
      search: [''],
      estado: [''],
      amenidad_id: ['']
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
        this.loadReservations();
      });
  }

  loadReservations(): void {
    this.isLoading = true;
    const filters = this.filterForm.value;

    const params: any = {
      page: this.pageIndex + 1,
      limit: this.pageSize
    };

    if (filters.estado) {
      params.estado = filters.estado;
    }

    if (filters.amenidad_id) {
      params.amenidad_id = filters.amenidad_id;
    }

    this.amenityRepository.getAllReservations(params).subscribe({
      next: (response) => {
        this.reservations = response.data;
        this.totalReservations = response.total;
        this.isLoading = false;
      },
      error: (error) => {
        this.notificationService.error('Error al cargar reservas');
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadReservations();
  }

  openApproveDialog(reservation: AmenityReservation): void {
    const dialogRef = this.dialog.open(ApproveRejectDialogComponent, {
      width: '500px',
      data: {
        reservation,
        action: 'aprobar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.approveReservation(reservation.id);
      }
    });
  }

  openRejectDialog(reservation: AmenityReservation): void {
    const dialogRef = this.dialog.open(ApproveRejectDialogComponent, {
      width: '500px',
      data: {
        reservation,
        action: 'rechazar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.rejectReservation(reservation.id, result.motivo);
      }
    });
  }

  approveReservation(id: number): void {
    this.amenityRepository.approveReservation(id).subscribe({
      next: () => {
        this.notificationService.success('Reserva aprobada exitosamente');
        this.loadReservations();
      },
      error: (error) => {
        this.notificationService.error(error.error?.message || 'Error al aprobar reserva');
      }
    });
  }

  rejectReservation(id: number, motivo?: string): void {
    this.amenityRepository.rejectReservation(id, motivo).subscribe({
      next: () => {
        this.notificationService.success('Reserva rechazada');
        this.loadReservations();
      },
      error: (error) => {
        this.notificationService.error(error.error?.message || 'Error al rechazar reserva');
      }
    });
  }

  getStatusClass(status: ReservationStatus): string {
    const statusMap: Record<ReservationStatus, string> = {
      [ReservationStatus.PENDIENTE]: 'status-pending',
      [ReservationStatus.CONFIRMADA]: 'status-confirmed',
      [ReservationStatus.CANCELADA]: 'status-cancelled',
      [ReservationStatus.COMPLETADA]: 'status-completed'
    };
    return statusMap[status];
  }

  getStatusIcon(status: ReservationStatus): string {
    const iconMap: Record<ReservationStatus, string> = {
      [ReservationStatus.PENDIENTE]: 'schedule',
      [ReservationStatus.CONFIRMADA]: 'check_circle',
      [ReservationStatus.CANCELADA]: 'cancel',
      [ReservationStatus.COMPLETADA]: 'done_all'
    };
    return iconMap[status];
  }

  canApproveReject(reservation: AmenityReservation): boolean {
    return reservation.estado === ReservationStatus.PENDIENTE && this.isAdmin();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin() || this.authService.isSuperAdmin();
  }

  clearFilters(): void {
    this.filterForm.reset({
      search: '',
      estado: '',
      amenidad_id: ''
    });
  }
}
