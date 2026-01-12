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
import { PaymentService } from '../../../core/services/payment.service';
import { GetAllServiceCostsUseCase } from '../../../domain/use-cases/service-cost/get-all-service-costs.usecase';
import { GetActiveResidentsUseCase } from '../../../domain/use-cases/user/get-active-residents.usecase';
import { GetAllResidencesUseCase } from '../../../domain/use-cases/residence/get-all-residences.usecase';
import { ServiceCost } from '../../../domain/models/service-cost.model';
import { User, UserRole } from '../../../domain/models/user.model';
import { Residence } from '../../../domain/models/residence.model';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-payment-form',
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
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.scss']
})
export class PaymentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private paymentService = inject(PaymentService);
  private getAllServiceCosts = inject(GetAllServiceCostsUseCase);
  private getActiveResidents = inject(GetActiveResidentsUseCase);
  private getAllResidences = inject(GetAllResidencesUseCase);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  paymentForm!: FormGroup;
  isEditMode = false;
  paymentId?: number;
  isLoading = false;
  isSaving = false;
  serviceCosts: ServiceCost[] = [];
  users: User[] = [];
  selectedCost: ServiceCost | null = null;
  selectedUserResidence: Residence | null = null;

  metodosPago: any[] = [];

  estados = [
    {
      value: 'Completado',
      label: 'Completado',
      icon: 'check_circle',
      color: '#4caf50'
    },
    {
      value: 'Pendiente',
      label: 'Pendiente',
      icon: 'schedule',
      color: '#ff9800'
    },
    {
      value: 'Rechazado',
      label: 'Rechazado',
      icon: 'cancel',
      color: '#f44336'
    }
  ];

  ngOnInit(): void {
    this.initPaymentMethods();
    this.initForm();
    this.loadServiceCosts();
    this.loadUsers();
    this.checkEditMode();
    this.checkQueryParams();
  }

  initPaymentMethods(): void {
    const currentUser = this.authService.getCurrentUser();
    const isAdmin = currentUser?.rol === UserRole.ADMINISTRADOR || currentUser?.rol === UserRole.SUPER_ADMIN;

    if (isAdmin) {
      // Admin solo puede registrar pagos en efectivo
      this.metodosPago = [
        {
          value: 'Efectivo',
          label: 'Efectivo',
          icon: 'payments',
          description: 'Pago en efectivo'
        }
      ];
    } else {
      // Residente solo puede pagar con tarjeta
      this.metodosPago = [
        {
          value: 'Tarjeta',
          label: 'Tarjeta',
          icon: 'credit_card',
          description: 'Tarjeta de crédito o débito'
        }
      ];
    }
  }

  initForm(): void {
    const currentUser = this.authService.getCurrentUser();
    const isAdmin = currentUser?.rol === UserRole.ADMINISTRADOR || currentUser?.rol === UserRole.SUPER_ADMIN;
    const defaultMetodo = isAdmin ? 'Efectivo' : 'Tarjeta';

    this.paymentForm = this.fb.group({
      usuario_id: [null, [Validators.required]],
      monto: ['', [Validators.required, Validators.min(0.01)]],
      metodo_pago: [defaultMetodo, [Validators.required]],
      fecha_pago: [new Date(), [Validators.required]],
      referencia: [''],
      notas: ['']
    });

    // Cuando cambie el usuario, autocompletar el monto de su renta
    this.paymentForm.get('usuario_id')?.valueChanges.subscribe(userId => {
      if (userId) {
        this.onUserChange(userId);
      }
    });
  }

  loadServiceCosts(): void {
    console.log('[PAYMENT-FORM] Loading service costs...');
    // Cargar todos los costos de servicio, no solo pendientes
    this.getAllServiceCosts.execute({ page: 1, limit: 1000 }).subscribe({
      next: (response) => {
        this.serviceCosts = response.data;
        console.log('[PAYMENT-FORM] Service costs loaded:', this.serviceCosts.length);
      },
      error: (error) => {
        console.error('[PAYMENT-FORM] Error loading service costs:', error);
        this.notificationService.error('Error al cargar costos de servicio');
      }
    });
  }

  loadUsers(): void {
    this.getActiveResidents.execute().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id && id !== 'new') {
      this.isEditMode = true;
      this.paymentId = +id;
      this.loadPayment();
    }
  }

  checkQueryParams(): void {
    this.route.queryParams.subscribe(params => {
      if (params['costo_id']) {
        this.paymentForm.patchValue({ costo_servicio_id: +params['costo_id'] });
      }
      if (params['usuario_id']) {
        this.paymentForm.patchValue({ usuario_id: +params['usuario_id'] });
      }
    });
  }

  loadPayment(): void {
    if (!this.paymentId) return;

    this.isLoading = true;
    this.paymentService.getPaymentById(this.paymentId).subscribe({
      next: (response) => {
        const payment = response.payment || response;
        this.paymentForm.patchValue({
          usuario_id: payment.residente_id || payment.usuario_id,
          monto: payment.monto_pagado || payment.monto,
          metodo_pago: payment.metodo_pago,
          fecha_pago: new Date(payment.fecha_pago),
          referencia: payment.referencia || '',
          notas: payment.notas || ''
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar pago:', error);
        this.notificationService.error('Error al cargar pago');
        this.router.navigate(['/payments']);
        this.isLoading = false;
      }
    });
  }

  onUserChange(userId: number): void {
    console.log('[PAYMENT-FORM] User changed:', userId);
    // Buscar la residencia del usuario
    this.getAllResidences.execute({ residente_actual_id: userId, limit: 1 }).subscribe({
      next: (response) => {
        if (response.data && response.data.length > 0) {
          this.selectedUserResidence = response.data[0];
          console.log('[PAYMENT-FORM] Residence found:', this.selectedUserResidence);

          // Autocompletar el monto con el precio de la residencia
          if (this.selectedUserResidence.precio) {
            this.paymentForm.patchValue({ monto: this.selectedUserResidence.precio });
            console.log('[PAYMENT-FORM] Rent amount autocompleted:', this.selectedUserResidence.precio);
          }
        } else {
          console.log('[PAYMENT-FORM] No residence found for user');
          this.selectedUserResidence = null;
          this.notificationService.warning('Este usuario no tiene una residencia asignada');
        }
      },
      error: (error) => {
        console.error('[PAYMENT-FORM] Error loading residence:', error);
        this.selectedUserResidence = null;
      }
    });
  }

  onSubmit(): void {
    if (this.paymentForm.valid) {
      this.isSaving = true;
      const formData = { ...this.paymentForm.value };

      if (formData.fecha_pago instanceof Date) {
        const year = formData.fecha_pago.getFullYear();
        const month = String(formData.fecha_pago.getMonth() + 1).padStart(2, '0');
        const day = String(formData.fecha_pago.getDate()).padStart(2, '0');
        formData.fecha_pago = `${year}-${month}-${day}`;
      }

      // Map to backend expected field names (sin servicio_costo_id y estado)
      const paymentData = {
        residente_id: formData.usuario_id,
        monto_pagado: formData.monto,
        metodo_pago: formData.metodo_pago,
        fecha_pago: formData.fecha_pago,
        referencia: formData.referencia || null,
        notas: formData.notas || null
      };

      const operation = this.isEditMode && this.paymentId
        ? this.paymentService.updatePayment(this.paymentId, paymentData)
        : this.paymentService.createPayment(paymentData);

      operation.subscribe({
        next: () => {
          this.notificationService.success(
            this.isEditMode ? 'Pago actualizado correctamente' : 'Pago registrado correctamente'
          );
          this.router.navigate(['/payments']);
        },
        error: (error) => {
          console.error('Error al guardar pago:', error);
          this.notificationService.error(error.error?.message || 'Error al guardar pago');
          this.isSaving = false;
        },
        complete: () => {
          this.isSaving = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.paymentForm);
      this.notificationService.warning('Por favor, completa todos los campos requeridos');
    }
  }

  onCancel(): void {
    if (this.paymentForm.dirty) {
      if (confirm('¿Estás seguro de cancelar? Los cambios no guardados se perderán.')) {
        this.router.navigate(['/payments']);
      }
    } else {
      this.router.navigate(['/payments']);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.paymentForm.get(fieldName);
    
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    
    if (control?.hasError('min')) {
      return 'El monto debe ser mayor a 0';
    }
    
    return '';
  }
}