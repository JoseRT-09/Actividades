import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PaymentRepository } from '../../repositories/payment.repository';

@Injectable({
  providedIn: 'root'
})
export class GetPaymentSummaryUseCase {
  private paymentRepository = inject(PaymentRepository);

  execute(year?: number): Observable<any> {
    return this.paymentRepository.getSummary(year);
  }
}