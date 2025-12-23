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
import { ResidenceService } from '../../../core/services/residence.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { MatChipsModule } from '@angular/material/chips';
import { GetActiveResidentsUseCase } from '../../../domain/use-cases/user/get-active-residents.usecase';

@Component({
  selector: 'app-residence-form',
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
    MatChipsModule
  ],
  templateUrl: './residence-form.component.html',
  styleUrls: ['./residence-form.component.scss']
})
export class ResidenceFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private residenceService = inject(ResidenceService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private getActiveResidents = inject(GetActiveResidentsUseCase);

  residenceForm!: FormGroup;
  isEditMode = false;
  residenceId?: number;
  isLoading = false;
  isSaving = false;
  residents: any[] = [];

  estados = [
    {
      value: 'Disponible',
      label: 'Disponible',
      icon: 'home_work',
      description: 'Lista para ser ocupada',
      color: '#4caf50'
    },
    {
      value: 'Ocupada',
      label: 'Ocupada',
      icon: 'home',
      description: 'Actualmente habitada',
      color: '#ff9800'
    },
    {
      value: 'Mantenimiento',
      label: 'Mantenimiento',
      icon: 'home_repair_service',
      description: 'En reparación o mejoras',
      color: '#f44336'
    }
  ];

  tiposPropiedad = [
    { value: 'Renta', label: 'Renta', icon: 'key', description: 'Residencia para alquiler' },
    { value: 'Compra', label: 'Compra', icon: 'sell', description: 'Residencia en venta' }
  ];

  ngOnInit(): void {
    this.initForm();
    this.loadUsers();
    this.checkEditMode();
  }

  initForm(): void {
    this.residenceForm = this.fb.group({
      numero_unidad: ['', [Validators.required, Validators.minLength(1)]],
      bloque: [''],
      piso: ['', [Validators.pattern(/^[0-9]+$/)]],
      area_m2: ['', [Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)]],
      habitaciones: ['', [Validators.pattern(/^[0-9]+$/)]],
      banos: ['', [Validators.pattern(/^[0-9]+(\.[0-9]{1})?$/)]],
      estacionamientos: ['', [Validators.pattern(/^[0-9]+$/)]],
      tipo_propiedad: [''],
      precio: ['', [Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)]],
      dueno_id: [null],
      residente_actual_id: [null],
      estado: ['Disponible', [Validators.required]],
      descripcion: [''],
      notas_adicionales: ['']
    });
  }

  loadUsers(): void {
    this.getActiveResidents.execute().subscribe({
      next: (residents) => {
        this.residents = residents;
      },
      error: (error) => {
        console.error('Error loading residents:', error);
      }
    });
  }

  checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id && id !== 'new') {
      this.isEditMode = true;
      this.residenceId = +id;
      this.loadResidence();
    }
  }

  loadResidence(): void {
    if (!this.residenceId) return;

    this.isLoading = true;
    // El servicio devuelve Observable<{ residence: Residence }>, por eso se corrige el acceso.
    this.residenceService.getResidenceById(this.residenceId).subscribe({
      next: (response) => {
        // ✅ CORRECCIÓN: Desempaquetar el objeto Residence
        const residence = response.residence;
        this.residenceForm.patchValue({
          numero_unidad: residence.numero_unidad,
          bloque: residence.bloque,
          piso: residence.piso,
          area_m2: residence.area_m2,
          habitaciones: residence.habitaciones,
          banos: residence.banos,
          estacionamientos: residence.estacionamientos,
          tipo_propiedad: residence.tipo_propiedad,
          precio: residence.precio,
          dueno_id: residence.dueno_id,
          residente_actual_id: residence.residente_actual_id,
          estado: residence.estado,
          descripcion: residence.descripcion,
          notas_adicionales: residence.notas_adicionales
        });
        this.isLoading = false;
      },
      error: (error) => {
        this.notificationService.error('Error al cargar residencia');
        this.router.navigate(['/residences']);
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.residenceForm.valid) {
      this.isSaving = true;
      const formData = { ...this.residenceForm.value };

      // Convertir valores vacíos a null
      Object.keys(formData).forEach(key => {
        if (formData[key] === '' || formData[key] === undefined) {
          formData[key] = null;
        }
      });

      const operation = this.isEditMode
        ? this.residenceService.updateResidence(this.residenceId!, formData)
        : this.residenceService.createResidence(formData);

      operation.subscribe({
        next: () => {
          this.notificationService.success(
            this.isEditMode ? 'Residencia actualizada correctamente' : 'Residencia creada correctamente'
          );
          this.router.navigate(['/residences']);
        },
        error: (error) => {
          this.notificationService.error(error.error?.message || 'Error al guardar residencia');
          this.isSaving = false;
        },
        complete: () => {
          this.isSaving = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.residenceForm);
      this.notificationService.warning('Por favor, completa todos los campos requeridos');
    }
  }

  onCancel(): void {
    if (this.residenceForm.dirty) {
      if (confirm('¿Estás seguro de cancelar? Los cambios no guardados se perderán.')) {
        this.router.navigate(['/residences']);
      }
    } else {
      this.router.navigate(['/residences']);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.residenceForm.get(fieldName);
    
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }

    if (control?.hasError('pattern')) {
      return 'Formato inválido';
    }
    
    return '';
  }

  getStatusColor(status: string): string {
    const estado = this.estados.find(e => e.value === status);
    return estado?.color || '#667eea';
  }

  getPrecioLabel(): string {
    const tipo = this.residenceForm.get('tipo_propiedad')?.value;
    if (tipo === 'Renta') return 'Precio Mensual de Renta';
    if (tipo === 'Compra') return 'Precio de Venta';
    return 'Precio';
  }
}