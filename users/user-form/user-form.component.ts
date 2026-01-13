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
import { MatStepperModule } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';
import { GetUserByIdUseCase } from '../../../domain/use-cases/user/get-user-by-id.usecase';
import { CreateUserUseCase } from '../../../domain/use-cases/user/create-user.usecase';
import { UpdateUserUseCase } from '../../../domain/use-cases/user/update-user.usecase';
import { User, UserRole, UserStatus } from '../../../domain/models/user.model';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-user-form',
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
    MatStepperModule,
    MatDividerModule
  ],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private getUserById = inject(GetUserByIdUseCase);
  private createUser = inject(CreateUserUseCase);
  private updateUser = inject(UpdateUserUseCase);
  private notificationService = inject(NotificationService);

  userForm!: FormGroup;
  isEditMode = false;
  userId?: number;
  isLoading = false;
  isSaving = false;
  hidePassword = true;

  roles = [
    { value: UserRole.RESIDENTE, label: 'Residente', icon: 'person', description: 'Usuario regular con acceso básico' },
    { value: UserRole.ADMINISTRADOR, label: 'Administrador', icon: 'admin_panel_settings', description: 'Gestión de residencias y usuarios' },
    { value: UserRole.SUPER_ADMIN, label: 'Super Admin', icon: 'shield', description: 'Control total del sistema' }
  ];

  estados = [
    { value: UserStatus.ACTIVO, label: 'Activo', icon: 'check_circle', color: 'success' },
    { value: UserStatus.INACTIVO, label: 'Inactivo', icon: 'cancel', color: 'warn' }
  ];

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  initForm(): void {
    this.userForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      password: ['', [Validators.minLength(6)]],
      rol: [UserRole.RESIDENTE, [Validators.required]],
      estado: [UserStatus.ACTIVO, [Validators.required]]
    });
  }

  checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id && id !== 'new') {
      this.isEditMode = true;
      this.userId = +id;
      this.loadUser();
      
      // En modo edición, la contraseña es opcional
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
    } else {
      // En modo creación, la contraseña es obligatoria
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.userForm.get('password')?.updateValueAndValidity();
    }
  }

  loadUser(): void {
    if (!this.userId) return;

    this.isLoading = true;
    this.getUserById.execute(this.userId).subscribe({
      next: (user) => {
        this.userForm.patchValue({
          nombre: user.nombre,
          apellido: user.apellido,
          email: user.email,
          telefono: user.telefono,
          rol: user.rol,
          estado: user.estado
        });
        this.isLoading = false;
      },
      error: (error) => {
        this.notificationService.error('Error al cargar usuario');
        this.router.navigate(['/users']);
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.isSaving = true;
      const formData = this.userForm.value;

      // Eliminar password si está vacío en modo edición
      if (this.isEditMode && !formData.password) {
        delete formData.password;
      }

      const operation = this.isEditMode
        ? this.updateUser.execute(this.userId!, formData)
        : this.createUser.execute(formData);

      operation.subscribe({
        next: () => {
          this.notificationService.success(
            this.isEditMode ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente'
          );
          this.router.navigate(['/users']);
        },
        error: (error) => {
          this.notificationService.error('Error al guardar usuario');
          this.isSaving = false;
        },
        complete: () => {
          this.isSaving = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.userForm);
      this.notificationService.warning('Por favor, completa todos los campos requeridos');
    }
  }

  onCancel(): void {
    if (this.userForm.dirty) {
      if (confirm('¿Estás seguro de cancelar? Los cambios no guardados se perderán.')) {
        this.router.navigate(['/users']);
      }
    } else {
      this.router.navigate(['/users']);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.userForm.get(fieldName);
    
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    
    if (control?.hasError('email')) {
      return 'Ingresa un email válido';
    }
    
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }

    if (control?.hasError('pattern')) {
      return 'Formato inválido (10 dígitos)';
    }
    
    return '';
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  getUserInitials(): string {
    const nombre = this.userForm.get('nombre')?.value || '';
    const apellido = this.userForm.get('apellido')?.value || '';
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  }
}