import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PaymentRepository } from '../../repositories/payment.repository';
import { Payment } from '../../models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class GetPaymentByIdUseCase {
  private paymentRepository = inject(PaymentRepository);

  execute(id: number): Observable<Payment> {
    return this.paymentRepository.getById(id);
  }
}