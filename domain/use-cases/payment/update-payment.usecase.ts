import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PaymentRepository } from '../../repositories/payment.repository';
import { Payment, UpdatePaymentDto } from '../../models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class UpdatePaymentUseCase {
  private paymentRepository = inject(PaymentRepository);

  execute(id: number, payment: UpdatePaymentDto): Observable<Payment> {
    return this.paymentRepository.update(id, payment);
  }
}