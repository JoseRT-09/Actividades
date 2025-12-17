import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { ResidenceRepository } from '../../domain/repositories/residence.repository';
import { ResidenceApiRepository } from '../../data/repositories/residence-api.repository';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { Residence, PropertyType, ResidenceStatus } from '../../domain/models/residence.model';

@Component({
  selector: 'app-my-residence',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule
  ],
  providers: [
    { provide: ResidenceRepository, useClass: ResidenceApiRepository }
  ],
  templateUrl: './my-residence.component.html',
  styleUrls: ['./my-residence.component.scss']
})
export class MyResidenceComponent implements OnInit {
  private residenceRepository = inject(ResidenceRepository);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  PropertyType = PropertyType;
  ResidenceStatus = ResidenceStatus;

  residence: Residence | null = null;
  isLoading = true;

  ngOnInit(): void {
    this.loadMyResidence();
  }

  loadMyResidence(): void {
    this.isLoading = true;
    const userId = this.authService.getCurrentUser()?.id;

    if (!userId) {
      this.notificationService.error('Usuario no autenticado');
      this.isLoading = false;
      return;
    }

    // Obtener residencia del usuario actual
    this.residenceRepository.getAll({ residente_actual_id: userId, limit: 1 }).subscribe({
      next: (response) => {
        if (response.data && response.data.length > 0) {
          this.residence = response.data[0];
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        this.notificationService.error('Error al cargar información de la residencia');
        this.isLoading = false;
      }
    });
  }

  isPurchase(): boolean {
    return this.residence?.tipo_propiedad === PropertyType.COMPRA;
  }

  isRent(): boolean {
    return this.residence?.tipo_propiedad === PropertyType.RENTA;
  }

  getStatusClass(status: ResidenceStatus): string {
    const statusMap: Record<ResidenceStatus, string> = {
      [ResidenceStatus.OCUPADA]: 'status-occupied',
      [ResidenceStatus.DISPONIBLE]: 'status-available',
      [ResidenceStatus.MANTENIMIENTO]: 'status-maintenance'
    };
    return statusMap[status];
  }

  getStatusIcon(status: ResidenceStatus): string {
    const iconMap: Record<ResidenceStatus, string> = {
      [ResidenceStatus.OCUPADA]: 'home',
      [ResidenceStatus.DISPONIBLE]: 'check_circle',
      [ResidenceStatus.MANTENIMIENTO]: 'build'
    };
    return iconMap[status];
  }

  formatCurrency(amount: number | undefined): string {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }

  formatArea(area: number | undefined): string {
    if (!area) return 'N/A';
    return `${area} m²`;
  }
}
