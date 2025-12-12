// En core/services/report.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Report {
  id: number;
  titulo: string;
  descripcion: string;
  // ✅ CORRECCIÓN: Tipos de reporte del backend (Mantenimiento, Limpieza, etc.)
  tipo: 'Mantenimiento' | 'Limpieza' | 'Seguridad' | 'Instalaciones' | 'Otro';
  prioridad: 'Baja' | 'Media' | 'Alta' | 'Crítica';
  estado: 'Abierto' | 'En Progreso' | 'Resuelto' | 'Cerrado';
  reportado_por_id?: number;
  reportado_por?: number;
  asignado_a?: number;
  residencia_id?: number;
  fecha_resolucion?: string;
  notas_adicionales?: string;
  created_at?: string;
  updated_at?: string;
  reportadoPor?: any;
  asignadoA?: any;
  residencia?: any;
  Residence?: any;
}

export interface ReportListResponse {
  data: Report[]; // Se mantiene 'data' (correcto)
  total: number;
  pages: number;
  currentPage: number;
}

export interface CreateReportData {
  titulo: string;
  descripcion: string;
  // ✅ CORRECCIÓN: Tipos de reporte del backend
  tipo: 'Mantenimiento' | 'Limpieza' | 'Seguridad' | 'Instalaciones' | 'Otro';
  prioridad?: 'Baja' | 'Media' | 'Alta' | 'Crítica';
  residencia_id?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reports`;

  getAllReports(filters?: any): Observable<ReportListResponse> {
    let params = new HttpParams();

    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          params = params.set(key, filters[key].toString());
        }
      });
    }

    return this.http.get<ReportListResponse>(this.apiUrl, { params });
  }

  getReportById(id: number): Observable<{ report: Report }> {
    return this.http.get<{ report: Report }>(`${this.apiUrl}/${id}`);
  }

  createReport(data: CreateReportData): Observable<{ message: string; report: Report }> {
    return this.http.post<{ message: string; report: Report }>(this.apiUrl, data);
  }

  updateReport(id: number, data: any): Observable<{ message: string; report: Report }> {
    return this.http.put<{ message: string; report: Report }>(`${this.apiUrl}/${id}`, data);
  }

  assignReport(id: number, asignado_a: number): Observable<{ message: string; report: Report }> {
    return this.http.post<{ message: string; report: Report }>(
      `${this.apiUrl}/${id}/assign`,
      { asignado_a }
    );
  }

  getReportsByUser(userId: number): Observable<{ reports: Report[]; count: number }> {
    return this.http.get<{ reports: Report[]; count: number }>(`${this.apiUrl}/user/${userId}`);
  }

  getReportsStatistics(): Observable<{
    total: number;
    byStatus: any;
    byPriority: any;
    byType: any[];
  }> {
    return this.http.get<any>(`${this.apiUrl}/statistics`);
  }

  deleteReport(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  // ===== MÉTODOS DE COMENTARIOS =====

  getCommentsByReport(reportId: number): Observable<{ comments: any[] }> {
    return this.http.get<{ comments: any[] }>(`${this.apiUrl}/${reportId}/comments`);
  }

  createComment(reportId: number, comment: string): Observable<{ message: string; comment: any }> {
    return this.http.post<{ message: string; comment: any }>(
      `${this.apiUrl}/${reportId}/comments`,
      { comment }
    );
  }

  deleteComment(commentId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/comments/${commentId}`);
  }
}