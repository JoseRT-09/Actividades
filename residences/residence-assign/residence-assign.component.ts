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
import { MatRadioModule } from '@angular/material/radio';
import { GetResidenceByIdUseCase } from '../../../domain/use-cases/residence/get-residence-by-id.usecase';
import { AssignResidentUseCase } from '../../../domain/use-cases/residence/assign-resident.usecase';
import { GetActiveResidentsUseCase } from '../../../domain/use-cases/user/get-active-residents.usecase';
import { Residence, ReassignmentType } from '../../../domain/models/residence.model';
import { User } from '../../../domain/models/user.model';
import { NotificationService } from '../../../core/services/notification.service';
import { FilterPipe } from '@shared/pipes/filter.pipe';

@Component({
  selector: 'app-residence-assign',
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
    MatRadioModule,
    FilterPipe
  ],
  templateUrl: './residence-assign.component.html',
  styleUrls: ['./residence-assign.component.scss']
})
export class ResidenceAssignComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private getResidenceById = inject(GetResidenceByIdUseCase);
  private assignResident = inject(AssignResidentUseCase);
  private getActiveResidents = inject(GetActiveResidentsUseCase);
  private notificationService = inject(NotificationService);

  assignForm!: FormGroup;
  residence: Residence | null = null;
  residents: User[] = [];
  isLoading = true;
  isSaving = false;
  residenceId!: number;

  reassignmentTypes = [
    { 
      value: ReassignmentType.ASIGNACION, 
      label: 'Asignación Inicial',
      icon: 'person_add',
      description: 'Primera asignación de residente a la unidad'
    },
    { 
      value: ReassignmentType.CAMBIO, 
      label: 'Cambio de Residente',
      icon: 'swap_horiz',
      description: 'Cambio del residente actual por otro'
    },
    { 
      value: ReassignmentType.LIBERACION, 
      label: 'Liberación',
      icon: 'person_remove',
      description: 'Liberar la unidad (sin residente)'
    }
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.residenceId = +id;
      this.initForm();
      this.loadResidence();
      this.loadResidents();
    } else {
      this.router.navigate(['/residences']);
    }
  }

  initForm(): void {
    this.assignForm = this.fb.group({
      residente_id: [null],
      residente_nuevo_id: [null], 
      tipo_cambio: [ReassignmentType.ASIGNACION, [Validators.required]],
      motivo: ['', [Validators.required, Validators.minLength(10)]],
      notas: ['']
    });

    // Listener para el tipo de cambio
    this.assignForm.get('tipo_cambio')?.valueChanges.subscribe(type => {
      if (type === ReassignmentType.LIBERACION) {
        this.assignForm.get('residente_id')?.clearValidators();
        this.assignForm.get('residente_id')?.setValue(null);
      } else {
        this.assignForm.get('residente_id')?.setValidators([Validators.required]);
      }
      this.assignForm.get('residente_id')?.updateValueAndValidity();
    });
  }

  loadResidence(): void {
    this.isLoading = true;
    
    this.getResidenceById.execute(this.residenceId).subscribe({
      next: (residence) => {
        this.residence = residence;
        
        // Determinar el tipo de cambio por defecto
        if (!residence.residenteActual) {
          this.assignForm.patchValue({ tipo_cambio: ReassignmentType.ASIGNACION });
        } else {
          this.assignForm.patchValue({ tipo_cambio: ReassignmentType.CAMBIO });
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        this.notificationService.error('Error al cargar residencia');
        this.router.navigate(['/residences']);
        this.isLoading = false;
      }
    });
  }

  loadResidents(): void {
    this.getActiveResidents.execute().subscribe({
      next: (residents) => {
        this.residents = residents;
      },
      error: (error) => {
        console.error('Error loading residents:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.assignForm.valid) {
      this.isSaving = true;
        const formData = {  
        residente_id: this.assignForm.get('residente_id')?.value,
        residente_nuevo_id: this.assignForm.get('residente_nuevo_id')?.value, 
        tipo_cambio: this.assignForm.get('tipo_cambio')?.value,
        motivo: this.assignForm.get('motivo')?.value,
        notas: this.assignForm.get('notas')?.value
      };

      this.assignResident.execute(this.residenceId, formData).subscribe({
        next: () => {
          this.notificationService.success('Residente asignado correctamente');
          this.router.navigate(['/residences', this.residenceId]);
        },
        error: (error) => {
          this.notificationService.error('Error al asignar residente');
          this.isSaving = false;
        },
        complete: () => {
          this.isSaving = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.assignForm);
      this.notificationService.warning('Por favor, completa todos los campos requeridos');
    }
  }

  onCancel(): void {
    if (this.assignForm.dirty) {
      if (confirm('¿Estás seguro de cancelar? Los cambios no guardados se perderán.')) {
        this.router.navigate(['/residences', this.residenceId]);
      }
    } else {
      this.router.navigate(['/residences', this.residenceId]);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.assignForm.get(fieldName);
    
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }
    
    return '';
  }

  getCurrentResidentName(): string {
    if (!this.residence?.residenteActual) return 'Sin residente';
    return `${this.residence.residenteActual.nombre} ${this.residence.residenteActual.apellido}`;
  }

  isLiberation(): boolean {
    return this.assignForm.get('tipo_cambio')?.value === ReassignmentType.LIBERACION;
  }
}