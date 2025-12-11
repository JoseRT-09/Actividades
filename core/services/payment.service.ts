import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Payment {
  id: number;
  residente_id: number;
  usuario_id?: number;
  servicio_costo_id?: number;
  costo_servicio_id?: number;
  monto_pagado: number;
  monto?: number;
  fecha_pago: string;
  metodo_pago?: 'Efectivo' | 'Transferencia' | 'Tarjeta' | 'Cheque';
  estado?: 'Completado' | 'Pendiente' | 'Rechazado';
  referencia?: string;
  notas?: string;
  comprobante_url?: string;
  created_at?: string;
  residente?: any;
  usuario?: any;
  servicioCosto?: any;
}

export interface PaymentListResponse {
  data: Payment[];
  total: number;
  pages: number;
  currentPage: number;
}

export interface CreatePaymentData {
  residente_id: number;
  servicio_costo_id?: number;
  monto_pagado: number;
  metodo_pago: 'Efectivo' | 'Transferencia' | 'Tarjeta' | 'Cheque';
  fecha_pago?: string;
  referencia?: string | null;
  notas?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/payments`;

  getAllPayments(filters?: any): Observable<PaymentListResponse> {
    let params = new HttpParams();

    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          params = params.set(key, filters[key].toString());
        }
      });
    }

    return this.http.get<PaymentListResponse>(this.apiUrl, { params });
  }

  getPaymentById(id: number): Observable<{ payment: Payment }> {
    return this.http.get<{ payment: Payment }>(`${this.apiUrl}/${id}`);
  }

  createPayment(data: CreatePaymentData): Observable<{ message: string; payment: Payment }> {
    return this.http.post<{ message: string; payment: Payment }>(this.apiUrl, data);
  }

  updatePayment(id: number, data: Partial<CreatePaymentData>): Observable<{ message: string; payment: Payment }> {
    return this.http.put<{ message: string; payment: Payment }>(`${this.apiUrl}/${id}`, data);
  }

  getPaymentsByResident(residenteId: number): Observable<{ payments: Payment[]; totalPaid: number; count: number }> {
    return this.http.get<{ payments: Payment[]; totalPaid: number; count: number }>(
      `${this.apiUrl}/resident/${residenteId}`
    );
  }

  getPaymentsSummary(year?: number): Observable<{ year: number; summary: any[] }> {
    let params = new HttpParams();
    if (year) params = params.set('year', year.toString());

    return this.http.get<{ year: number; summary: any[] }>(`${this.apiUrl}/summary`, { params });
  }

  deletePayment(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}