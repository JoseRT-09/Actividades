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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ComplaintService } from '../../../core/services/complaint.service';
import { ResidenceService } from '../../../core/services/residence.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-complaint-form',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSelectModule,
    MatProgressSpinnerModule, MatDividerModule,
    MatDatepickerModule, MatNativeDateModule, MatCheckboxModule
  ],
  templateUrl: './complaint-form.component.html',
  styleUrls: ['./complaint-form.component.scss']
})
export class ComplaintFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private complaintService = inject(ComplaintService);
  private residenceService = inject(ResidenceService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  complaintForm!: FormGroup;
  isEditMode = false;
  complaintId?: number;
  isLoading = false;
  isSaving = false;
  residences: any[] = [];

  categorias = [
    { value: 'Ruido', label: 'Ruido', icon: 'volume_up', description: 'Molestias por ruido excesivo' },
    { value: 'Convivencia', label: 'Convivencia', icon: 'groups', description: 'Problemas de convivencia entre residentes' },
    { value: 'Mascotas', label: 'Mascotas', icon: 'pets', description: 'Situaciones relacionadas con mascotas' },
    { value: 'Estacionamiento', label: 'Estacionamiento', icon: 'local_parking', description: 'Problemas de estacionamiento' },
    { value: 'Áreas Comunes', label: 'Áreas Comunes', icon: 'domain', description: 'Mal uso de áreas comunes' },
    { value: 'Limpieza', label: 'Limpieza', icon: 'cleaning_services', description: 'Falta de limpieza o higiene' },
    { value: 'Seguridad', label: 'Seguridad', icon: 'security', description: 'Problemas de seguridad' },
    { value: 'Mantenimiento', label: 'Mantenimiento', icon: 'build', description: 'Falta de mantenimiento' },
    { value: 'Administración', label: 'Administración', icon: 'admin_panel_settings', description: 'Quejas sobre administración' },
    { value: 'Otro', label: 'Otro', icon: 'help_outline', description: 'Otras quejas' }
  ];

  prioridades = [
    { value: 'Baja', label: 'Baja', icon: 'arrow_downward', color: '#4caf50', description: 'No requiere atención inmediata' },
    { value: 'Media', label: 'Media', icon: 'remove', color: '#ffc107', description: 'Requiere atención en corto plazo' },
    { value: 'Alta', label: 'Alta', icon: 'arrow_upward', color: '#ff9800', description: 'Requiere atención prioritaria' },
    { value: 'Urgente', label: 'Urgente', icon: 'priority_high', color: '#f44336', description: 'Requiere atención inmediata' }
  ];

  estados = [
    { value: 'Nueva', label: 'Nueva', icon: 'fiber_new' },
    { value: 'En Revisión', label: 'En Revisión', icon: 'rate_review' },
    { value: 'En Proceso', label: 'En Proceso', icon: 'sync' },
    { value: 'Resuelta', label: 'Resuelta', icon: 'check_circle' },
    { value: 'Rechazada', label: 'Rechazada', icon: 'block' }
  ];

  ngOnInit(): void {
    this.initForm();
    this.loadResidences();
    this.checkEditMode();
  }

  initForm(): void {
    this.complaintForm = this.fb.group({
      asunto: ['', [Validators.required, Validators.minLength(5)]],
      descripcion: ['', [Validators.required, Validators.minLength(20)]],
      categoria: ['Otro', [Validators.required]],
      prioridad: ['Media'],
      residencia_id: [null],
      es_anonima: [false],
      estado: ['Nueva']
    });
  }

  loadResidences(): void {
    this.residenceService.getAllResidences({ page: 1, limit: 1000 }).subscribe({
      next: (response) => {
        // Ya está corregido en el service, 'response' tiene la propiedad 'data'
        this.residences = response.data; 
      },
      error: (error) => {
        console.error('Error loading residences:', error);
      }
    });
  }

  checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id && id !== 'new') {
      this.isEditMode = true;
      this.complaintId = +id;
      this.loadComplaint();
    }
  }

loadComplaint(): void {
  if (!this.complaintId) return;

  this.isLoading = true;
  // El servicio devuelve Observable<{ complaint: Complaint }>, por eso se corrige el acceso.
  this.complaintService.getComplaintById(this.complaintId).subscribe({
    next: (response) => {
      // ✅ CORRECCIÓN: Desempaquetar el objeto Complaint
      const complaint = response.complaint;
      this.complaintForm.patchValue({
        asunto: complaint.asunto,
        descripcion: complaint.descripcion,
        categoria: complaint.categoria,
        prioridad: complaint.prioridad,
        residencia_id: complaint.residencia_id,
        es_anonima: complaint.es_anonima
      });
      this.isLoading = false;
    },
    error: (error) => {
      this.notificationService.error('Error al cargar queja');
      this.router.navigate(['/complaints']);
      this.isLoading = false;
    }
  });
}

  onSubmit(): void {
    if (this.complaintForm.valid) {
      this.isSaving = true;
      const formData = { ...this.complaintForm.value };

      // Convertir valores vacíos a null
      Object.keys(formData).forEach(key => {
        if (formData[key] === '' || formData[key] === undefined) {
          formData[key] = null;
        }
      });

      const operation = this.isEditMode && this.complaintId
        ? this.complaintService.updateComplaint(this.complaintId, formData)
        : this.complaintService.createComplaint(formData);

      operation.subscribe({
        next: () => {
          this.notificationService.success(
            this.isEditMode ? 'Queja actualizada correctamente' : 'Queja creada correctamente'
          );
          this.router.navigate(['/complaints']);
        },
        error: (error) => {
          this.notificationService.error(error.error?.message || 'Error al guardar queja');
          this.isSaving = false;
        },
        complete: () => {
          this.isSaving = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.complaintForm);
      this.notificationService.warning('Por favor, completa todos los campos requeridos');
    }
  }

  onCancel(): void {
    if (this.complaintForm.dirty) {
      if (confirm('¿Estás seguro de cancelar? Los cambios no guardados se perderán.')) {
        this.router.navigate(['/complaints']);
      }
    } else {
      this.router.navigate(['/complaints']);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      formGroup.get(key)?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.complaintForm.get(fieldName);
    
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }
    
    return '';
  }

  canEditStatus(): boolean {
    return this.authService.isAdmin();
  }
}