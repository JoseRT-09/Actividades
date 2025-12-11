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
import { ActivityService } from '../../../core/services/activity.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-activity-form',
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
    MatNativeDateModule
  ],
  templateUrl: './activity-form.component.html',
  styleUrls: ['./activity-form.component.scss']
})
export class ActivityFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private activityService = inject(ActivityService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  activityForm!: FormGroup;
  isEditMode = false;
  activityId?: number;
  isLoading = false;
  isSaving = false;

  tipos = [
    { value: 'Reunión', label: 'Reunión', icon: 'group', description: 'Reunión de residentes o junta' },
    { value: 'Evento', label: 'Evento', icon: 'event', description: 'Evento social o comunitario' },
    { value: 'Mantenimiento', label: 'Mantenimiento', icon: 'build', description: 'Trabajo de mantenimiento programado' },
    { value: 'Asamblea', label: 'Asamblea', icon: 'how_to_vote', description: 'Asamblea general de propietarios' },
    { value: 'Celebración', label: 'Celebración', icon: 'celebration', description: 'Fiesta o celebración' },
    { value: 'Otro', label: 'Otro', icon: 'event_note', description: 'Otra actividad' }
  ];

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  initForm(): void {
    const currentUser = this.authService.getCurrentUser();

    this.activityForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(5)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      tipo: ['Evento', [Validators.required]],
      fecha_inicio: [new Date(), [Validators.required]],
      hora_inicio: ['', [Validators.required]],
      fecha_fin: [''],
      hora_fin: [''],
      ubicacion: ['', [Validators.required]],
      organizador_id: [currentUser?.id, [Validators.required]],
      max_participantes: [null],
      notas: ['']
    });
  }

  checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id && id !== 'new') {
      this.isEditMode = true;
      this.activityId = +id;
      this.loadActivity();
    }
  }

  loadActivity(): void {
    if (!this.activityId) return;

    this.isLoading = true;
    this.activityService.getActivityById(this.activityId).subscribe({
      next: (response) => {
        const activity = response.activity || response;
        const fechaInicio = new Date(activity.fecha_inicio);
        const fechaFin = activity.fecha_fin ? new Date(activity.fecha_fin) : null;

        this.activityForm.patchValue({
          titulo: activity.titulo,
          descripcion: activity.descripcion,
          tipo: activity.tipo,
          fecha_inicio: fechaInicio,
          hora_inicio: this.formatTime(fechaInicio),
          fecha_fin: fechaFin,
          hora_fin: fechaFin ? this.formatTime(fechaFin) : '',
          ubicacion: activity.ubicacion,
          organizador_id: activity.organizador_id,
          max_participantes: activity.max_participantes,
          notas: activity.notas
        });
        this.isLoading = false;
      },
      error: (error) => {
        this.notificationService.error('Error al cargar actividad');
        this.router.navigate(['/activities']);
        this.isLoading = false;
      }
    });
  }

  private formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  onSubmit(): void {
    if (this.activityForm.valid) {
      this.isSaving = true;
      const formData = { ...this.activityForm.value };

      // Combinar fecha y hora para fecha_inicio
      if (formData.fecha_inicio instanceof Date && formData.hora_inicio) {
        const year = formData.fecha_inicio.getFullYear();
        const month = String(formData.fecha_inicio.getMonth() + 1).padStart(2, '0');
        const day = String(formData.fecha_inicio.getDate()).padStart(2, '0');
        formData.fecha_inicio = `${year}-${month}-${day} ${formData.hora_inicio}:00`;
      }

      // Combinar fecha y hora para fecha_fin
      if (formData.fecha_fin instanceof Date && formData.hora_fin) {
        const year = formData.fecha_fin.getFullYear();
        const month = String(formData.fecha_fin.getMonth() + 1).padStart(2, '0');
        const day = String(formData.fecha_fin.getDate()).padStart(2, '0');
        formData.fecha_fin = `${year}-${month}-${day} ${formData.hora_fin}:00`;
      } else if (formData.fecha_fin instanceof Date && !formData.hora_fin) {
        // Si hay fecha_fin pero no hora_fin, set to null
        formData.fecha_fin = null;
      }

      // Remover los campos de hora ya que los combinamos con las fechas
      delete formData.hora_inicio;
      delete formData.hora_fin;

      // Auto-set estado to 'Programada' for new activities
      if (!this.isEditMode) {
        formData.estado = 'Programada';
      }

      // Convertir valores vacíos a null
      Object.keys(formData).forEach(key => {
        if (formData[key] === '' || formData[key] === undefined) {
          formData[key] = null;
        }
      });

      const operation = this.isEditMode
        ? this.activityService.updateActivity(this.activityId!, formData)
        : this.activityService.createActivity(formData);

      operation.subscribe({
        next: () => {
          this.notificationService.success(
            this.isEditMode ? 'Actividad actualizada correctamente' : 'Actividad creada correctamente'
          );
          this.router.navigate(['/activities']);
        },
        error: (error) => {
          this.notificationService.error(error.error?.message || 'Error al guardar actividad');
          this.isSaving = false;
        },
        complete: () => {
          this.isSaving = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.activityForm);
      this.notificationService.warning('Por favor, completa todos los campos requeridos');
    }
  }

  onCancel(): void {
    if (this.activityForm.dirty) {
      if (confirm('¿Estás seguro de cancelar? Los cambios no guardados se perderán.')) {
        this.router.navigate(['/activities']);
      }
    } else {
      this.router.navigate(['/activities']);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.activityForm.get(fieldName);

    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }

    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }

    return '';
  }
}
