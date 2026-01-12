import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { StripeService, CardInfo } from '../../../core/services/stripe.service';
import { NotificationService } from '../../../core/services/notification.service';

export interface CardPaymentDialogData {
  amount: number;
  serviceCostId: number;
  residentId: number;
  serviceName: string;
}

@Component({
  selector: 'app-card-payment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './card-payment-dialog.component.html',
  styleUrls: ['./card-payment-dialog.component.scss']
})
export class CardPaymentDialogComponent {
  private fb = inject(FormBuilder);
  private stripeService = inject(StripeService);
  private notificationService = inject(NotificationService);
  private dialogRef = inject(MatDialogRef<CardPaymentDialogComponent>);

  cardForm: FormGroup;
  isProcessing = false;
  cardType = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data: CardPaymentDialogData) {
    this.cardForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      cardHolder: ['', [Validators.required, Validators.minLength(3)]],
      expiryDate: ['', [Validators.required, Validators.pattern(/^\d{2}\/\d{2}$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]]
    });

    // Detectar tipo de tarjeta mientras se escribe
    this.cardForm.get('cardNumber')?.valueChanges.subscribe(value => {
      if (value) {
        this.cardType = this.stripeService.getCardType(value);
      }
    });
  }

  formatCardNumber(event: any): void {
    let value = event.target.value.replace(/\s/g, '');
    value = value.replace(/\D/g, ''); // Solo números
    if (value.length > 16) {
      value = value.substr(0, 16);
    }
    this.cardForm.patchValue({ cardNumber: value }, { emitEvent: true });
  }

  formatExpiryDate(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substr(0, 2) + '/' + value.substr(2, 2);
    }
    event.target.value = value;
  }

  formatCVV(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 4) {
      value = value.substr(0, 4);
    }
    event.target.value = value;
  }

  onSubmit(): void {
    if (this.cardForm.valid && !this.isProcessing) {
      this.isProcessing = true;

      const cardInfo: CardInfo = {
        cardNumber: this.cardForm.value.cardNumber,
        cardHolder: this.cardForm.value.cardHolder.toUpperCase(),
        expiryDate: this.cardForm.value.expiryDate,
        cvv: this.cardForm.value.cvv
      };

      console.log('[CARD-PAYMENT] Processing payment:', {
        amount: this.data.amount,
        serviceName: this.data.serviceName
      });

      this.stripeService.processCardPayment(
        cardInfo,
        this.data.amount,
        this.data.serviceCostId,
        this.data.residentId
      ).subscribe({
        next: (result) => {
          console.log('[CARD-PAYMENT] Payment successful:', result);
          this.notificationService.success(
            `¡Pago procesado exitosamente! ID: ${result.transactionId}`
          );
          this.dialogRef.close({ success: true, result });
        },
        error: (error) => {
          console.error('[CARD-PAYMENT] Payment failed:', error);
          this.notificationService.error(
            error.error || 'Error al procesar el pago. Por favor, intente nuevamente.'
          );
          this.isProcessing = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.cardForm);
      this.notificationService.warning('Por favor, complete todos los campos correctamente');
    }
  }

  onCancel(): void {
    this.dialogRef.close({ success: false });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getCardIcon(): string {
    switch (this.cardType) {
      case 'Visa':
        return 'credit_card';
      case 'Mastercard':
        return 'credit_card';
      case 'American Express':
        return 'credit_card';
      default:
        return 'credit_card';
    }
  }
}
