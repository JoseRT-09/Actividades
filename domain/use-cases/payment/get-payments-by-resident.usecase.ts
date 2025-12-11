import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PaymentRepository } from '../../repositories/payment.repository';
import { Payment } from '../../models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class GetPaymentsByResidentUseCase {
  private paymentRepository = inject(PaymentRepository);

  execute(residentId: number): Observable<{ payments: Payment[], totalPaid: number }> {
    return this.paymentRepository.getByResident(residentId);
  }
}