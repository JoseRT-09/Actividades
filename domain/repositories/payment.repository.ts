import { Observable } from 'rxjs';
import { Payment, CreatePaymentDto, UpdatePaymentDto } from '../models/payment.model';
import { PaginatedResponse, QueryParams } from './base.repository';

export abstract class PaymentRepository {
  abstract getAll(params?: QueryParams): Observable<PaginatedResponse<Payment>>;
  abstract getById(id: number): Observable<Payment>;
  abstract create(payment: CreatePaymentDto): Observable<Payment>;
  abstract update(id: number, payment: UpdatePaymentDto): Observable<Payment>;
  abstract delete(id: number): Observable<void>;
  abstract getByResident(residentId: number): Observable<{ payments: Payment[], totalPaid: number }>;
  abstract getSummary(year?: number): Observable<any>;
}