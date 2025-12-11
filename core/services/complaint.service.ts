import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Complaint {
  id: number;
  asunto: string;
  descripcion: string;
  categoria: 'Ruido' | 'Convivencia' | 'Mascotas' | 'Estacionamiento' | 'Áreas Comunes' | 'Limpieza' | 'Seguridad' | 'Mantenimiento' | 'Administración' | 'Otro';
  prioridad: 'Baja' | 'Media' | 'Alta' | 'Urgente';
  estado: 'Nueva' | 'En Revisión' | 'En Proceso' | 'Resuelta' | 'Cerrada' | 'Rechazada';
  usuario_id: number;
  residencia_id?: number;
  fecha_queja: string;
  es_anonima: boolean;
  created_at?: string;
  updated_at?: string;
  usuario?: any;
  residencia?: any;
}

export interface ComplaintListResponse {
  data: Complaint[]; // ✅ CORRECCIÓN: El backend devuelve la lista en 'data'
  total: number;
  pages: number;
  currentPage: number;
}

export interface CreateComplaintData {
  asunto: string;
  descripcion: string;
  categoria?: 'Ruido' | 'Convivencia' | 'Mascotas' | 'Estacionamiento' | 'Áreas Comunes' | 'Limpieza' | 'Seguridad' | 'Mantenimiento' | 'Administración' | 'Otro';
  prioridad?: 'Baja' | 'Media' | 'Alta' | 'Urgente';
  residencia_id?: number;
  fecha_queja?: string;
  es_anonima?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ComplaintService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/complaints`;

  getAllComplaints(filters?: {
    estado?: string;
    categoria?: string;
    prioridad?: string;
    search?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    page?: number;
    limit?: number;
  }): Observable<ComplaintListResponse> {
    let params = new HttpParams();

    if (filters) {
      if (filters.estado) params = params.set('estado', filters.estado);
      if (filters.categoria) params = params.set('categoria', filters.categoria);
      if (filters.prioridad) params = params.set('prioridad', filters.prioridad);
      if (filters.search) params = params.set('search', filters.search);
      if (filters.fecha_inicio) params = params.set('fecha_inicio', filters.fecha_inicio);
      if (filters.fecha_fin) params = params.set('fecha_fin', filters.fecha_fin);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
    }

    return this.http.get<ComplaintListResponse>(this.apiUrl, { params });
  }

  getComplaintById(id: number): Observable<{ complaint: Complaint }> { // ✅ CORRECCIÓN: Envuelve el objeto de respuesta
    return this.http.get<{ complaint: Complaint }>(`${this.apiUrl}/${id}`);
  }

  createComplaint(data: CreateComplaintData): Observable<{ message: string; complaint: Complaint }> {
    return this.http.post<{ message: string; complaint: Complaint }>(this.apiUrl, data);
  }

  updateComplaint(id: number, data: Partial<CreateComplaintData & {
    estado?: 'Nueva' | 'En Revisión' | 'En Proceso' | 'Resuelta' | 'Cerrada' | 'Rechazada';
  }>): Observable<{ message: string; complaint: Complaint }> {
    return this.http.put<{ message: string; complaint: Complaint }>(`${this.apiUrl}/${id}`, data);
  }

  respondToComplaint(id: number, data: { respuesta: string; estado?: string }): Observable<{ message: string; complaint: Complaint }> {
    return this.http.post<{ message: string; complaint: Complaint }>(
      `${this.apiUrl}/${id}/respond`,
      data
    );
  }

  getComplaintsByUser(userId: number): Observable<{ complaints: Complaint[]; count: number }> {
    return this.http.get<{ complaints: Complaint[]; count: number }>(`${this.apiUrl}/user/${userId}`);
  }

  deleteComplaint(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}