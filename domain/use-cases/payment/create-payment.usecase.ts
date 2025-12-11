import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PaymentRepository } from '../../repositories/payment.repository';
import { Payment, CreatePaymentDto } from '../../models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class CreatePaymentUseCase {
  private paymentRepository = inject(PaymentRepository);

  execute(payment: CreatePaymentDto): Observable<Payment> {
    return this.paymentRepository.create(payment);
  }
}