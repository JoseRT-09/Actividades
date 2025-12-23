import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Residence {
  id: number;
  numero_unidad: string;
  bloque?: string;
  piso?: number;
  area_m2?: number;
  habitaciones?: number;
  banos?: number;
  estacionamientos?: number;
  tipo_propiedad?: 'Renta' | 'Compra';
  precio?: number;
  dueno_id?: number;
  residente_actual_id?: number;
  administrador_id?: number;
  fecha_asignacion?: string | null; // ✅ CORRECCIÓN: Permite null (si se desasigna)
  estado: 'Disponible' | 'Ocupada' | 'Mantenimiento';
  descripcion?: string;
  notas_adicionales?: string;
  dueno?: any;
  residenteActual?: any;
  administrador?: any;
  created_at?: string;
  updated_at?: string;
}

export interface ResidenceListResponse {
  residences: Residence[]; // Backend devuelve la lista en 'residences'
  total: number;
  pages: number;
  currentPage: number;
}

export interface CreateResidenceData {
  numero_unidad: string;
  bloque?: string;
  piso?: number;
  area_m2?: number;
  habitaciones?: number;
  banos?: number;
  estacionamientos?: number;
  tipo_propiedad?: 'Renta' | 'Compra';
  precio?: number;
  dueno_id?: number;
  residente_actual_id?: number;
  administrador_id?: number;
  estado?: 'Disponible' | 'Ocupada' | 'Mantenimiento';
  descripcion?: string;
  notas_adicionales?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ResidenceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/residences`;

  getAllResidences(filters?: {
    estado?: string;
    bloque?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Observable<ResidenceListResponse> {
    let params = new HttpParams();

    if (filters) {
      if (filters.estado) params = params.set('estado', filters.estado);
      if (filters.bloque) params = params.set('bloque', filters.bloque);
      if (filters.search) params = params.set('search', filters.search);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
    }

    return this.http.get<ResidenceListResponse>(this.apiUrl, { params });
  }

  getResidenceById(id: number): Observable<{ residence: Residence }> { // ✅ CORRECCIÓN: Envuelve el objeto de respuesta
    return this.http.get<{ residence: Residence }>(`${this.apiUrl}/${id}`);
  }

  createResidence(data: CreateResidenceData): Observable<{ message: string; residence: Residence }> {
    return this.http.post<{ message: string; residence: Residence }>(this.apiUrl, data);
  }

  updateResidence(id: number, data: Partial<CreateResidenceData>): Observable<{ message: string; residence: Residence }> {
    return this.http.put<{ message: string; residence: Residence }>(`${this.apiUrl}/${id}`, data);
  }

  assignResident(
    residenceId: number,
    data: {
      residente_nuevo_id?: number;
      tipo_cambio?: string;
      motivo?: string;
      notas?: string;
    }
  ): Observable<{ message: string; residence: Residence }> {
    return this.http.post<{ message: string; residence: Residence }>(
      `${this.apiUrl}/${residenceId}/assign`,
      data
    );
  }

  getReassignmentHistory(residenceId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${residenceId}/history`);
  }

  deleteResidence(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}