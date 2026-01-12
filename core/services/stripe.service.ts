import { Injectable, inject } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { PaymentService, CreatePaymentData } from './payment.service';

export interface CardInfo {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
}

export interface StripePaymentResult {
  success: boolean;
  transactionId?: string;
  message?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private paymentService = inject(PaymentService);

  /**
   * Simula el procesamiento de un pago con tarjeta usando Stripe
   * En producción, esto llamaría a la API real de Stripe
   */
  processCardPayment(
    cardInfo: CardInfo,
    amount: number,
    serviceCostId: number,
    residentId: number
  ): Observable<StripePaymentResult> {
    console.log('[STRIPE] Processing card payment:', {
      amount,
      serviceCostId,
      residentId,
      cardLast4: cardInfo.cardNumber.slice(-4)
    });

    // Validar información de tarjeta
    if (!this.validateCard(cardInfo)) {
      return throwError(() => ({
        success: false,
        error: 'Información de tarjeta inválida'
      }));
    }

    // Simular procesamiento de pago (en producción sería una llamada a Stripe API)
    return new Observable(observer => {
      // Simular delay de procesamiento
      setTimeout(() => {
        // Generar ID de transacción simulado
        const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        console.log('[STRIPE] Payment processed successfully:', transactionId);

        // Crear el registro de pago en el sistema
        const paymentData: CreatePaymentData = {
          residente_id: residentId,
          monto_pagado: amount,
          metodo_pago: 'Tarjeta',
          fecha_pago: new Date().toISOString().split('T')[0],
          referencia: transactionId,
          notas: `Pago procesado con tarjeta terminada en ${cardInfo.cardNumber.slice(-4)}`
        };

        // Solo agregar servicio_costo_id si existe
        if (serviceCostId && serviceCostId > 0) {
          paymentData.servicio_costo_id = serviceCostId;
        }

        this.paymentService.createPayment(paymentData).subscribe({
          next: (response) => {
            console.log('[STRIPE] Payment registered in system:', response);
            observer.next({
              success: true,
              transactionId,
              message: 'Pago procesado exitosamente'
            });
            observer.complete();
          },
          error: (error) => {
            console.error('[STRIPE] Error registering payment:', error);
            observer.error({
              success: false,
              error: 'Error al registrar el pago en el sistema'
            });
          }
        });
      }, 2000); // Simular 2 segundos de procesamiento
    });
  }

  /**
   * Valida la información de la tarjeta
   */
  private validateCard(cardInfo: CardInfo): boolean {
    // Validar número de tarjeta (debe tener 16 dígitos)
    const cardNumberClean = cardInfo.cardNumber.replace(/\s/g, '');
    if (!/^\d{16}$/.test(cardNumberClean)) {
      return false;
    }

    // Validar nombre del titular (no vacío)
    if (!cardInfo.cardHolder || cardInfo.cardHolder.trim().length < 3) {
      return false;
    }

    // Validar fecha de expiración (MM/YY formato)
    if (!/^\d{2}\/\d{2}$/.test(cardInfo.expiryDate)) {
      return false;
    }

    // Validar que la tarjeta no esté vencida
    const [month, year] = cardInfo.expiryDate.split('/').map(Number);
    const now = new Date();
    const expiry = new Date(2000 + year, month - 1);
    if (expiry < now) {
      return false;
    }

    // Validar CVV (debe tener 3 o 4 dígitos)
    if (!/^\d{3,4}$/.test(cardInfo.cvv)) {
      return false;
    }

    return true;
  }

  /**
   * Obtiene el tipo de tarjeta según el número
   */
  getCardType(cardNumber: string): string {
    const cleanNumber = cardNumber.replace(/\s/g, '');

    if (/^4/.test(cleanNumber)) return 'Visa';
    if (/^5[1-5]/.test(cleanNumber)) return 'Mastercard';
    if (/^3[47]/.test(cleanNumber)) return 'American Express';

    return 'Desconocida';
  }

  /**
   * Formatea el número de tarjeta para mostrar
   */
  formatCardNumber(cardNumber: string): string {
    const clean = cardNumber.replace(/\s/g, '');
    const groups = clean.match(/.{1,4}/g);
    return groups ? groups.join(' ') : clean;
  }
}
