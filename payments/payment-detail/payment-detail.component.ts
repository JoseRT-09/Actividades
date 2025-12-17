import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { GetPaymentByIdUseCase } from '../../../domain/use-cases/payment/get-payment-by-id.usecase';
import { DeletePaymentUseCase } from '../../../domain/use-cases/payment/delete-payment.usecase';
import { Payment, PaymentStatus, PaymentMethod } from '../../../domain/models/payment.model';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-payment-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatMenuModule
  ],
  templateUrl: './payment-detail.component.html',
  styleUrls: ['./payment-detail.component.scss']
})
export class PaymentDetailComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private getPaymentById = inject(GetPaymentByIdUseCase);
  private deletePayment = inject(DeletePaymentUseCase);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  payment: Payment | null = null;
  isLoading = true;
  paymentId!: number;
  shouldPrint = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.paymentId = +id;
      this.loadPayment();
      this.checkPrintMode();
    } else {
      this.router.navigate(['/payments']);
    }
  }

  checkPrintMode(): void {
    this.route.queryParams.subscribe(params => {
      if (params['print'] === 'true') {
        this.shouldPrint = true;
        // Esperar a que cargue el contenido antes de imprimir
        setTimeout(() => {
          window.print();
        }, 1000);
      }
    });
  }

  loadPayment(): void {
    this.isLoading = true;
    
    this.getPaymentById.execute(this.paymentId).subscribe({
      next: (payment) => {
        this.payment = payment;
        this.isLoading = false;
      },
      error: (error) => {
        this.notificationService.error('Error al cargar pago');
        this.router.navigate(['/payments']);
        this.isLoading = false;
      }
    });
  }

  onEdit(): void {
    this.router.navigate(['/payments', this.paymentId, 'edit']);
  }

  onDelete(): void {
    if (!this.payment) return;

    const confirmed = confirm(
      `¿Estás seguro de eliminar este pago?\n\nMonto: $${this.payment.monto}\n\nEsta acción no se puede deshacer.`
    );

    if (confirmed) {
      this.deletePayment.execute(this.paymentId).subscribe({
        next: () => {
          this.notificationService.success('Pago eliminado correctamente');
          this.router.navigate(['/payments']);
        },
        error: () => {
          this.notificationService.error('Error al eliminar pago');
        }
      });
    }
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

  getMethodIcon(method: PaymentMethod): string {
    const iconMap: Record<PaymentMethod, string> = {
      [PaymentMethod.EFECTIVO]: 'payments',
      [PaymentMethod.TARJETA]: 'credit_card',
      [PaymentMethod.TRANSFERENCIA]: 'account_balance',
      [PaymentMethod.CHEQUE]: 'receipt'
    };
    return iconMap[method];
  }

  getUserName(): string {
    if (!this.payment?.usuario) return 'Usuario desconocido';
    return `${this.payment.usuario.nombre} ${this.payment.usuario.apellido}`;
  }

  getUserInitials(): string {
    if (!this.payment?.usuario) return '??';
    return `${this.payment.usuario.nombre.charAt(0)}${this.payment.usuario.apellido.charAt(0)}`.toUpperCase();
  }

  canEdit(): boolean {
    return this.authService.isAdmin();
  }

  canDelete(): boolean {
    return this.authService.isSuperAdmin();
  }

  printReceipt(): void {
    window.print();
  }

  downloadPDF(): void {
    this.notificationService.info('Generando PDF...');
  }

  sendEmail(): void {
    if (!this.payment?.usuario) return;
    this.notificationService.info(`Enviando recibo a ${this.payment.usuario.email}...`);
  }
}