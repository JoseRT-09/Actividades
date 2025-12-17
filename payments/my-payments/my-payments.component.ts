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
import { PaymentRepository } from '../../domain/repositories/payment.repository';
import { PaymentApiRepository } from '../../data/repositories/payment-api.repository';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { Payment, PaymentStatus, PaymentMethod } from '../../domain/models/payment.model';

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
    MatProgressSpinnerModule
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
  private authService = inject(AuthService);

  PaymentStatus = PaymentStatus;
  PaymentMethod = PaymentMethod;

  payments: Payment[] = [];
  isLoading = false;
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

  // Statistics
  totalPaid = 0;
  totalPending = 0;
  paymentCount = 0;

  ngOnInit(): void {
    this.loadMyPayments();
  }

  loadMyPayments(): void {
    this.isLoading = true;
    const userId = this.authService.getCurrentUser()?.id;

    if (!userId) {
      this.notificationService.error('Usuario no autenticado');
      this.isLoading = false;
      return;
    }

    const params: any = {
      page: this.pageIndex + 1,
      limit: this.pageSize,
      usuario_id: userId
    };

    this.paymentRepository.getAll(params).subscribe({
      next: (response) => {
        this.payments = response.data;
        this.totalPayments = response.total;
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
}
