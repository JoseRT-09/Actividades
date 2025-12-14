import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { GetAmenityByIdUseCase } from '../../../domain/use-cases/amenity/get-amenity-by-id.usecase';
import { CreateAmenityUseCase } from '../../../domain/use-cases/amenity/create-amenity.usecase';
import { UpdateAmenityUseCase } from '../../../domain/use-cases/amenity/update-amenity.usecase';
import { Amenity, AmenityType, AmenityStatus } from '../../../domain/models/amenity.model';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-amenity-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatSlideToggleModule,
    MatCheckboxModule
  ],
  templateUrl: './amenity-form.component.html',
  styleUrls: ['./amenity-form.component.scss']
})
export class AmenityFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private getAmenityById = inject(GetAmenityByIdUseCase);
  private createAmenity = inject(CreateAmenityUseCase);
  private updateAmenity = inject(UpdateAmenityUseCase);
  private notificationService = inject(NotificationService);

  amenityForm!: FormGroup;
  isEditMode = false;
  amenityId?: number;
  isLoading = false;
  isSaving = false;

  tipos = [
    { value: AmenityType.SALON_EVENTOS, label: 'Salón de Eventos', icon: 'event', description: 'Espacio para eventos y celebraciones' },
    { value: AmenityType.GIMNASIO, label: 'Gimnasio', icon: 'fitness_center', description: 'Área de ejercicio y fitness' },
    { value: AmenityType.PISCINA, label: 'Piscina', icon: 'pool', description: 'Área de piscina y natación' },
    { value: AmenityType.CANCHA_DEPORTIVA, label: 'Cancha Deportiva', icon: 'sports_tennis', description: 'Cancha para deportes' },
    { value: AmenityType.AREA_BBQ, label: 'Área BBQ', icon: 'outdoor_grill', description: 'Zona de parrillas y asados' },
    { value: AmenityType.SALON_JUEGOS, label: 'Salón de Juegos', icon: 'sports_esports', description: 'Área de entretenimiento' },
    { value: AmenityType.AREA_INFANTIL, label: 'Área Infantil', icon: 'child_care', description: 'Zona de juegos para niños' },
    { value: AmenityType.OTRO, label: 'Otro', icon: 'home_work', description: 'Otra amenidad' }
  ];

  estados = [
    { value: AmenityStatus.DISPONIBLE, label: 'Disponible', icon: 'check_circle', color: '#4caf50' },
    { value: AmenityStatus.OCUPADA, label: 'Ocupada', icon: 'schedule', color: '#ff9800' },
    { value: AmenityStatus.MANTENIMIENTO, label: 'Mantenimiento', icon: 'build', color: '#2196f3' },
    { value: AmenityStatus.FUERA_SERVICIO, label: 'Fuera de Servicio', icon: 'cancel', color: '#f44336' }
  ];

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  initForm(): void {
    this.amenityForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      tipo: [AmenityType.SALON_EVENTOS, [Validators.required]],
      ubicacion: ['', [Validators.required]],
      capacidad_maxima: [null],
      horario_inicio: [''],
      horario_fin: [''],
      costo_reserva: [0, [Validators.required, Validators.min(0)]],
      requiere_aprobacion: [false],
      disponible_reserva: [true],
      estado: [AmenityStatus.DISPONIBLE, [Validators.required]],
      reglas: ['']
    });
  }

  checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id && id !== 'new') {
      this.isEditMode = true;
      this.amenityId = +id;
      this.loadAmenity();
    }
  }

  loadAmenity(): void {
    if (!this.amenityId) return;

    this.isLoading = true;
    this.getAmenityById.execute(this.amenityId).subscribe({
      next: (amenity) => {
        this.amenityForm.patchValue({
          nombre: amenity.nombre,
          descripcion: amenity.descripcion,
          tipo: amenity.tipo,
          ubicacion: amenity.ubicacion,
          capacidad_maxima: amenity.capacidad_maxima || amenity.capacidad,
          horario_inicio: amenity.horario_inicio || amenity.horario_apertura,
          horario_fin: amenity.horario_fin || amenity.horario_cierre,
          costo_reserva: amenity.costo_reserva ?? amenity.costo_uso,
          requiere_aprobacion: amenity.requiere_aprobacion,
          disponible_reserva: amenity.disponible_reserva ?? amenity.requiere_reserva,
          estado: amenity.estado,
          reglas: amenity.reglas
        });
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
    if (this.amenityForm.valid) {
      this.isSaving = true;
      const formData = { ...this.amenityForm.value };

      // Convertir valores vacíos a null
      Object.keys(formData).forEach(key => {
        if (formData[key] === '' || formData[key] === undefined) {
          formData[key] = null;
        }
      });

      const operation = this.isEditMode && this.amenityId
        ? this.updateAmenity.execute(this.amenityId, formData)
        : this.createAmenity.execute(formData);

      operation.subscribe({
        next: () => {
          this.notificationService.success(
            this.isEditMode ? 'Amenidad actualizada correctamente' : 'Amenidad creada correctamente'
          );
          this.router.navigate(['/amenities']);
        },
        error: (error) => {
          this.notificationService.error('Error al guardar amenidad');
          this.isSaving = false;
        },
        complete: () => {
          this.isSaving = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.amenityForm);
      this.notificationService.warning('Por favor, completa todos los campos requeridos');
    }
  }

  onCancel(): void {
    if (this.amenityForm.dirty) {
      if (confirm('¿Estás seguro de cancelar? Los cambios no guardados se perderán.')) {
        this.router.navigate(['/amenities']);
      }
    } else {
      this.router.navigate(['/amenities']);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.amenityForm.get(fieldName);
    
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }

    if (control?.hasError('min')) {
      return 'El valor debe ser mayor o igual a 0';
    }
    
    return '';
  }
}