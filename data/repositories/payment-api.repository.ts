import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PaymentRepository } from '../../domain/repositories/payment.repository';
import { PaginatedResponse, QueryParams } from '@domain/repositories';
import { Payment, CreatePaymentDto, UpdatePaymentDto } from '../../domain/models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentApiRepository extends PaymentRepository {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/payments`;

  getAll(params?: QueryParams): Observable<PaginatedResponse<Payment>> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }

    return this.http.get<any>(this.apiUrl, { params: httpParams }).pipe(
      map(response => ({
        total: response.total,
        pages: response.pages,
        currentPage: response.currentPage,
        data: this.transformPayments(response.payments)
      }))
    );
  }

  getById(id: number): Observable<Payment> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => this.transformPayment(response.payment))
    );
  }

  create(payment: CreatePaymentDto): Observable<Payment> {
    return this.http.post<any>(this.apiUrl, payment).pipe(
      map(response => this.transformPayment(response.payment))
    );
  }

  update(id: number, payment: UpdatePaymentDto): Observable<Payment> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, payment).pipe(
      map(response => this.transformPayment(response.payment))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getByResident(residentId: number): Observable<{ payments: Payment[], totalPaid: number }> {
    return this.http.get<any>(`${this.apiUrl}/resident/${residentId}`).pipe(
      map(response => ({
        payments: this.transformPayments(response.payments),
        totalPaid: response.totalPaid
      }))
    );
  }

  getSummary(year?: number): Observable<any> {
    let params = new HttpParams();
    if (year) {
      params = params.set('year', year.toString());
    }
    return this.http.get<any>(`${this.apiUrl}/summary/monthly`, { params });
  }

  private transformPayment(payment: any): Payment {
    return {
      ...payment,
      monto: payment.monto_pagado || payment.monto,
      usuario: payment.residente || payment.usuario,
      residente: payment.residente || payment.usuario,
      costoServicio: this.transformServiceCost(payment.servicioCosto || payment.costoServicio),
      servicioCosto: this.transformServiceCost(payment.servicioCosto || payment.costoServicio)
    };
  }

  private transformPayments(payments: any[]): Payment[] {
    return payments.map(p => this.transformPayment(p));
  }

  private transformServiceCost(serviceCost: any): any {
    if (!serviceCost) return null;
    return {
      ...serviceCost,
      concepto: serviceCost.nombre_servicio || serviceCost.concepto,
      residencia: serviceCost.Residence || serviceCost.residencia
    };
  }
}