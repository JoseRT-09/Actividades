// Frontend/src/app/presentation/reports/report-form/report-form.component.ts (CORREGIDO FINAL)
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
import { MatChipsModule } from '@angular/material/chips';
import { ReportService } from '../../../core/services/report.service';
import { ResidenceService } from '../../../core/services/residence.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-report-form',
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule
  ],
  templateUrl: './report-form.component.html',
  styleUrls: ['./report-form.component.scss']
})
export class ReportFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private reportService = inject(ReportService);
  private residenceService = inject(ResidenceService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  reportForm!: FormGroup;
  isEditMode = false;
  reportId?: number;
  isLoading = false;
  isSaving = false;
  residences: any[] = [];

  // ✅ CORRECCIÓN: Tipos actualizados según el ENUM de PostgreSQL
  tipos = [
    {
      value: 'Mantenimiento', // Antes era 'Incendio'
      label: 'Mantenimiento',
      icon: 'build',
      description: 'Problemas generales de mantenimiento'
    },
    {
      value: 'Limpieza', // Antes era 'Eléctrico'
      label: 'Limpieza',
      icon: 'cleaning_services',
      description: 'Problemas de limpieza y basura'
    },
    {
      value: 'Seguridad', // Antes era 'Agua'
      label: 'Seguridad',
      icon: 'security',
      description: 'Problemas de seguridad'
    },
    {
      value: 'Instalaciones', // Antes era 'Robo'
      label: 'Instalaciones',
      icon: 'devices',
      description: 'Problemas con instalaciones fijas'
    },
    {
      value: 'Otro',
      label: 'Otro',
      icon: 'help_outline',
      description: 'Otras incidencias'
    }
  ];

  prioridades = [
    {
      value: 'Baja',
      label: 'Baja',
      icon: 'arrow_downward',
      color: '#4caf50',
      description: 'No es urgente'
    },
    {
      value: 'Media',
      label: 'Media',
      icon: 'remove',
      color: '#ffc107',
      description: 'Atención moderada'
    },
    {
      value: 'Alta',
      label: 'Alta',
      icon: 'arrow_upward',
      color: '#ff9800',
      description: 'Requiere atención pronta'
    },
    {
      value: 'Crítica',
      label: 'Crítica',
      icon: 'priority_high',
      color: '#f44336',
      description: 'Atención inmediata'
    }
  ];

  estados = [
    {
      value: 'Abierto',
      label: 'Abierto',
      icon: 'error_outline',
      color: '#ff9800'
    },
    {
      value: 'En Progreso',
      label: 'En Progreso',
      icon: 'sync',
      color: '#2196f3'
    },
    {
      value: 'Resuelto',
      label: 'Resuelto',
      icon: 'check_circle',
      color: '#4caf50'
    },
  ];

  ngOnInit(): void {
    this.initForm();
    this.loadResidences();
    this.checkEditMode();
  }

  initForm(): void {
    this.reportForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(5)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      tipo: ['Otro', [Validators.required]],
      prioridad: ['Media'],
      residencia_id: [null]
    });
  }

  loadResidences(): void {
    this.residenceService.getAllResidences({ page: 1, limit: 1000 }).subscribe({
      next: (response) => {
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
      this.reportId = +id;
      this.loadReport();
    }
  }

  loadReport(): void {
    if (!this.reportId) return;

    this.isLoading = true;
    this.reportService.getReportById(this.reportId).subscribe({
      next: (response) => {
        const report = response.report;
        this.reportForm.patchValue({
          titulo: report.titulo,
          descripcion: report.descripcion,
          tipo: report.tipo,
          prioridad: report.prioridad,
          residencia_id: report.residencia_id
        });
        this.isLoading = false;
      },
      error: (error) => {
        this.notificationService.error('Error al cargar reporte');
        this.router.navigate(['/reports']);
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.reportForm.valid) {
      this.isSaving = true;
      const formData = { ...this.reportForm.value };

      // Convertir valores vacíos a null
      Object.keys(formData).forEach(key => {
        if (formData[key] === '' || formData[key] === undefined) {
          formData[key] = null;
        }
      });

      const operation = this.isEditMode
        ? this.reportService.updateReport(this.reportId!, formData)
        : this.reportService.createReport(formData);

      operation.subscribe({
        next: () => {
          this.notificationService.success(
            this.isEditMode ? 'Reporte actualizado correctamente' : 'Reporte creado correctamente'
          );
          this.router.navigate(['/reports']);
        },
        error: (error) => {
          this.notificationService.error(error.error?.message || 'Error al guardar reporte');
          this.isSaving = false;
        },
        complete: () => {
          this.isSaving = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.reportForm);
      this.notificationService.warning('Por favor, completa todos los campos requeridos');
    }
  }

  onCancel(): void {
    if (this.reportForm.dirty) {
      if (confirm('¿Estás seguro de cancelar? Los cambios no guardados se perderán.')) {
        this.router.navigate(['/reports']);
      }
    } else {
      this.router.navigate(['/reports']);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.reportForm.get(fieldName);
    
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }
    
    return '';
  }

  getTypeIcon(type: string): string {
    const tipo = this.tipos.find(t => t.value === type);
    return tipo?.icon || 'help_outline';
  }

  isAdmin(): boolean {
    return this.authService.isAdmin() || this.authService.isSuperAdmin();
  }
}