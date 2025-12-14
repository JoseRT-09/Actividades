import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { AmenityService, Amenity } from '../../../core/services/amenity.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-amenity-booking',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatDividerModule, MatDatepickerModule, MatNativeDateModule
  ],
  templateUrl: './amenity-booking.component.html',
  styleUrls: ['./amenity-booking.component.scss']
})
export class AmenityBookingComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private amenityService = inject(AmenityService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  bookingForm!: FormGroup;
  amenity: Amenity | null = null;
  isLoading = true;
  isSaving = false;
  amenityId!: number;
  minDate = new Date();

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.amenityId = +id;
      this.initForm();
      this.loadAmenity();
    } else {
      this.router.navigate(['/amenities']);
    }
  }

  initForm(): void {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    this.bookingForm = this.fb.group({
      fecha_reserva: [today, [Validators.required]],
      hora_inicio: ['', [Validators.required, Validators.pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)]],
      hora_fin: ['', [Validators.required, Validators.pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)]],
      notas: ['', [Validators.maxLength(500)]]
    });
  }

  loadAmenity(): void {
    this.isLoading = true;
    this.amenityService.getAmenityById(this.amenityId).subscribe({
      next: (response) => {
        this.amenity = response.amenity;

        if (this.amenity.estado === 'En Mantenimiento' || this.amenity.estado === 'Fuera de Servicio') {
          this.notificationService.warning('Esta amenidad no está disponible para reservas');
          this.router.navigate(['/amenities', this.amenityId]);
        }

        this.isLoading = false;
      },
      error: (error) => {
        this.notificationService.error('Error al cargar amenidad');
        this.router.navigate(['/amenities']);
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.bookingForm.valid) {
      this.isSaving = true;
      const formData = { ...this.bookingForm.value };

      // Convertir fecha a formato YYYY-MM-DD
      if (formData.fecha_reserva instanceof Date) {
        const year = formData.fecha_reserva.getFullYear();
        const month = String(formData.fecha_reserva.getMonth() + 1).padStart(2, '0');
        const day = String(formData.fecha_reserva.getDate()).padStart(2, '0');
        formData.fecha_reserva = `${year}-${month}-${day}`;
      }

      this.amenityService.reserveAmenity(this.amenityId, formData).subscribe({
        next: (response) => {
          this.notificationService.success('Reserva creada correctamente');
          this.router.navigate(['/amenities']);
          this.isSaving = false;
        },
        error: (error) => {
          this.notificationService.error(error.error?.message || 'Error al crear reserva');
          this.isSaving = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.bookingForm);
      this.notificationService.warning('Por favor, completa todos los campos requeridos');
    }
  }

  onCancel(): void {
    this.router.navigate(['/amenities', this.amenityId]);
  }

  isAdminOrSuperAdmin(): boolean {
    return this.authService.isAdmin() || this.authService.isSuperAdmin();
  }

  getCosto(): number {
    if (!this.amenity) return 0;
    return this.amenity.costo || this.amenity.costo_por_hora || 0;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      formGroup.get(key)?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.bookingForm.get(fieldName);

    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }

    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }

    if (control?.hasError('min')) {
      return 'Debe ser al menos 1 persona';
    }

    return '';
  }
}