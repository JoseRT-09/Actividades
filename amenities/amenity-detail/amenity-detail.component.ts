import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { GetAmenityByIdUseCase } from '../../../domain/use-cases/amenity/get-amenity-by-id.usecase';
import { DeleteAmenityUseCase } from '../../../domain/use-cases/amenity/delete-amenity.usecase';
import { Amenity, AmenityStatus, AmenityType } from '../../../domain/models/amenity.model';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-amenity-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatCardModule, MatButtonModule,
    MatIconModule, MatChipsModule, MatDividerModule,
    MatProgressSpinnerModule, MatMenuModule
  ],
  templateUrl: './amenity-detail.component.html',
  styleUrls: ['./amenity-detail.component.scss']
})
export class AmenityDetailComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private getAmenityById = inject(GetAmenityByIdUseCase);
  private deleteAmenity = inject(DeleteAmenityUseCase);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  // Exponer enums al template
  AmenityStatus = AmenityStatus;
  AmenityType = AmenityType;

  amenity: Amenity | null = null;
  isLoading = true;
  amenityId!: number;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.amenityId = +id;
      this.loadAmenity();
    } else {
      this.router.navigate(['/amenities']);
    }
  }

  loadAmenity(): void {
    this.isLoading = true;
    this.getAmenityById.execute(this.amenityId).subscribe({
      next: (amenity) => {
        this.amenity = amenity;
        this.isLoading = false;
      },
      error: (error) => {
        this.notificationService.error('Error al cargar amenidad');
        this.router.navigate(['/amenities']);
        this.isLoading = false;
      }
    });
  }

  onEdit(): void {
    this.router.navigate(['/amenities', this.amenityId, 'edit']);
  }

  onBooking(): void {
    this.router.navigate(['/amenities', this.amenityId, 'booking']);
  }

  onDelete(): void {
    if (!this.amenity) return;
    if (confirm(`¿Estás seguro de eliminar la amenidad "${this.amenity.nombre}"?`)) {
      this.deleteAmenity.execute(this.amenityId).subscribe({
        next: () => {
          this.notificationService.success('Amenidad eliminada correctamente');
          this.router.navigate(['/amenities']);
        },
        error: () => {
          this.notificationService.error('Error al eliminar amenidad');
        }
      });
    }
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

  canEdit(): boolean {
    return this.authService.isAdmin();
  }

  canDelete(): boolean {
    return this.authService.isSuperAdmin();
  }
}