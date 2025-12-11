import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PaymentRepository } from '../../repositories/payment.repository';
import { Payment } from '../../models/payment.model';
import { PaginatedResponse, QueryParams } from '../../repositories/base.repository';

@Injectable({
  providedIn: 'root'
})
export class GetAllPaymentsUseCase {
  private paymentRepository = inject(PaymentRepository);

  execute(params?: QueryParams): Observable<PaginatedResponse<Payment>> {
    return this.paymentRepository.getAll(params);
  }
}