import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PaymentRepository } from '../../repositories/payment.repository';

@Injectable({
  providedIn: 'root'
})
export class DeletePaymentUseCase {
  private paymentRepository = inject(PaymentRepository);

  execute(id: number): Observable<void> {
    return this.paymentRepository.delete(id);
  }
}