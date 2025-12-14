import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AmenityRepository } from '../../domain/repositories/amenity.repository';
import { AmenityApiRepository } from '../../data/repositories/amenity-api.repository';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { AmenityReservation, ReservationStatus } from '../../domain/models/amenity.model';

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  providers: [
    { provide: AmenityRepository, useClass: AmenityApiRepository }
  ],
  templateUrl: './my-reservations.component.html',
  styleUrls: ['./my-reservations.component.scss']
})
export class MyReservationsComponent implements OnInit {
  private amenityRepository = inject(AmenityRepository);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  ReservationStatus = ReservationStatus;

  reservations: AmenityReservation[] = [];
  isLoading = false;
  totalReservations = 0;
  pageSize = 10;
  pageIndex = 0;

  displayedColumns: string[] = [
    'amenidad',
    'fecha_reserva',
    'horario',
    'num_personas',
    'estado',
    'acciones'
  ];

  ngOnInit(): void {
    this.loadMyReservations();
  }

  loadMyReservations(): void {
    this.isLoading = true;
    const userId = this.authService.getCurrentUser()?.id;

    const params: any = {
      page: this.pageIndex + 1,
      limit: this.pageSize,
      residente_id: userId
    };

    this.amenityRepository.getAllReservations(params).subscribe({
      next: (response) => {
        this.reservations = response.data;
        this.totalReservations = response.total;
        this.isLoading = false;
      },
      error: (error: any) => {
        this.notificationService.error('Error al cargar mis reservas');
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadMyReservations();
  }

  cancelReservation(id: number): void {
    if (confirm('¿Está seguro que desea cancelar esta reserva?')) {
      this.amenityRepository.cancelReservation(id).subscribe({
        next: () => {
          this.notificationService.success('Reserva cancelada exitosamente');
          this.loadMyReservations();
        },
        error: (error: any) => {
          this.notificationService.error(error.error?.message || 'Error al cancelar reserva');
        }
      });
    }
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

  canCancel(reservation: AmenityReservation): boolean {
    return reservation.estado === ReservationStatus.PENDIENTE ||
           reservation.estado === ReservationStatus.CONFIRMADA;
  }

  isPastReservation(reservation: AmenityReservation): boolean {
    const reservationDate = new Date(reservation.fecha_reserva);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return reservationDate < today;
  }

  getPendingCount(): number {
    return this.reservations.filter(r => r.estado === ReservationStatus.PENDIENTE).length;
  }

  getConfirmedCount(): number {
    return this.reservations.filter(r => r.estado === ReservationStatus.CONFIRMADA).length;
  }

  getCompletedCount(): number {
    return this.reservations.filter(r => r.estado === ReservationStatus.COMPLETADA).length;
  }

  getCancelledCount(): number {
    return this.reservations.filter(r => r.estado === ReservationStatus.CANCELADA).length;
  }
}
