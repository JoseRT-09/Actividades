import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { PaymentRepository } from '../../domain/repositories/payment.repository';
import { PaymentApiRepository } from '../../data/repositories/payment-api.repository';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { Payment, PaymentStatus, PaymentMethod } from '../../domain/models/payment.model';
import { ServiceCost } from '../../domain/models/service-cost.model';
import { Residence, PropertyType } from '../../domain/models/residence.model';
import { GetPendingCostsByResidenceUseCase } from '../../domain/use-cases/service-cost/get-pending-costs-by-residence.usecase';
import { GetAllResidencesUseCase } from '../../domain/use-cases/residence/get-all-residences.usecase';

@Component({
  selector: 'app-my-payments',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  providers: [
    { provide: PaymentRepository, useClass: PaymentApiRepository }
  ],
  templateUrl: './my-payments.component.html',
  styleUrls: ['./my-payments.component.scss']
})
export class MyPaymentsComponent implements OnInit {
  private paymentRepository = inject(PaymentRepository);
  private notificationService = inject(NotificationService);
  authService = inject(AuthService); // Public for template access
  private getPendingCosts = inject(GetPendingCostsByResidenceUseCase);
  private getAllResidences = inject(GetAllResidencesUseCase);

  PaymentStatus = PaymentStatus;
  PaymentMethod = PaymentMethod;
  PropertyType = PropertyType;

  payments: Payment[] = [];
  pendingCosts: ServiceCost[] = [];
  residence: Residence | null = null;
  residenceId: number | null = null;
  isLoading = false;
  isLoadingCosts = false;
  isLoadingResidence = false;
  totalPayments = 0;
  pageSize = 10;
  pageIndex = 0;

  displayedColumns: string[] = [
    'fecha_pago',
    'concepto',
    'monto',
    'metodo_pago',
    'estado'
  ];

  pendingCostsColumns: string[] = [
    'nombre_servicio',
    'monto',
    'fecha_vencimiento',
    'periodo',
    'acciones'
  ];

  // Statistics
  totalPaid = 0;
  totalPending = 0;
  paymentCount = 0;
  totalPendingCosts = 0;

  ngOnInit(): void {
    this.loadUserResidence();
    this.loadMyPayments();
  }

  loadUserResidence(): void {
    const userId = this.authService.getCurrentUser()?.id;
    if (!userId) return;

    this.isLoadingResidence = true;
    this.getAllResidences.execute({ residente_actual_id: userId, limit: 1 }).subscribe({
      next: (response) => {
        if (response.data && response.data.length > 0) {
          this.residence = response.data[0];
          this.residenceId = this.residence.id;

          // Solo cargar costos pendientes si es renta
          if (this.residence.tipo_propiedad === PropertyType.RENTA) {
            this.loadPendingCosts();
          }
        }
        this.isLoadingResidence = false;
      },
      error: (error) => {
        console.error('Error al cargar residencia:', error);
        this.isLoadingResidence = false;
      }
    });
  }

  loadPendingCosts(): void {
    if (!this.residenceId) return;

    this.isLoadingCosts = true;
    this.getPendingCosts.execute(this.residenceId).subscribe({
      next: (response) => {
        this.pendingCosts = response.pendingCosts;
        this.totalPendingCosts = response.totalPending;
        this.isLoadingCosts = false;
      },
      error: (error) => {
        console.error('Error al cargar costos pendientes:', error);
        this.isLoadingCosts = false;
      }
    });
  }

  loadMyPayments(): void {
    this.isLoading = true;
    const userId = this.authService.getCurrentUser()?.id;

    if (!userId) {
      this.notificationService.error('Usuario no autenticado');
      this.isLoading = false;
      return;
    }

    this.paymentRepository.getByResident(userId).subscribe({
      next: (response) => {
        this.payments = response.payments;
        this.totalPayments = response.payments.length;
        this.totalPaid = response.totalPaid;
        this.calculateStatistics();
        this.isLoading = false;
      },
      error: (error: any) => {
        this.notificationService.error('Error al cargar pagos');
        this.isLoading = false;
      }
    });
  }

  calculateStatistics(): void {
    this.totalPaid = this.payments
      .filter(p => p.estado === PaymentStatus.COMPLETADO)
      .reduce((sum, p) => sum + p.monto_pagado, 0);

    this.totalPending = this.payments
      .filter(p => p.estado === PaymentStatus.PENDIENTE)
      .reduce((sum, p) => sum + (p.monto - p.monto_pagado), 0);

    this.paymentCount = this.payments.length;
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadMyPayments();
  }

  getStatusClass(status: PaymentStatus): string {
    const statusMap: Record<PaymentStatus, string> = {
      [PaymentStatus.COMPLETADO]: 'status-completed',
      [PaymentStatus.PENDIENTE]: 'status-pending',
      [PaymentStatus.RECHAZADO]: 'status-rejected'
    };
    return statusMap[status];
  }

  getStatusIcon(status: PaymentStatus): string {
    const iconMap: Record<PaymentStatus, string> = {
      [PaymentStatus.COMPLETADO]: 'check_circle',
      [PaymentStatus.PENDIENTE]: 'schedule',
      [PaymentStatus.RECHAZADO]: 'cancel'
    };
    return iconMap[status];
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }

  getCompletedCount(): number {
    return this.payments.filter(p => p.estado === PaymentStatus.COMPLETADO).length;
  }

  getPendingCount(): number {
    return this.payments.filter(p => p.estado === PaymentStatus.PENDIENTE).length;
  }

  getRejectedCount(): number {
    return this.payments.filter(p => p.estado === PaymentStatus.RECHAZADO).length;
  }

  getPaymentMethodIcon(method: PaymentMethod): string {
    const methodMap: Record<PaymentMethod, string> = {
      [PaymentMethod.EFECTIVO]: 'attach_money',
      [PaymentMethod.TRANSFERENCIA]: 'swap_horiz',
      [PaymentMethod.TARJETA]: 'credit_card',
      [PaymentMethod.CHEQUE]: 'receipt'
    };
    return methodMap[method] || 'payment';
  }

  // Helpers para tipo de propiedad
  isRenta(): boolean {
    return this.residence?.tipo_propiedad === PropertyType.RENTA;
  }

  isCompra(): boolean {
    return this.residence?.tipo_propiedad === PropertyType.COMPRA;
  }

  getPrecioMensual(): number {
    return this.residence?.precio || 0;
  }

  getPrecioCompra(): number {
    return this.residence?.precio || 0;
  }
}
