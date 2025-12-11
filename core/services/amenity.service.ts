import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
export interface Amenity {
  id: number;
  nombre: string;
  descripcion?: string;
  tipo?: string;
  ubicacion?: string;
  capacidad?: number;
  capacidad_maxima?: number;
  horario_disponible?: string;
  horario_inicio?: string;
  horario_apertura?: string;
  horario_fin?: string;
  horario_cierre?: string;
  requiere_aprobacion?: boolean;
  costo?: number;
  costo_por_hora?: number;
  estado: 'Disponible' | 'Ocupada' | 'En Mantenimiento' | 'Fuera de Servicio';
  imagen_url?: string;
  reservaciones_activas?: number;
  ultima_reserva?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AmenityListResponse {
  data: Amenity[];
  total: number;
  pages: number;
  currentPage: number;
}

export interface CreateAmenityData {
  nombre: string;
  descripcion?: string;
  tipo?: string;
  ubicacion?: string;
  capacidad?: number;
  horario_disponible?: string;
  estado?: 'Disponible' | 'Ocupada' | 'En Mantenimiento' | 'Fuera de Servicio';
  imagen_url?: string;
}

export interface ReserveAmenityData {
  fecha_reserva: string;
  hora_inicio: string;
  hora_fin: string;
  notas?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AmenityService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/amenities`;

  getAllAmenities(filters?: {
    tipo?: string;
    estado?: string;
    page?: number;
    limit?: number;
  }): Observable<AmenityListResponse> {
    let params = new HttpParams();

    if (filters) {
      if (filters.tipo) params = params.set('tipo', filters.tipo);
      if (filters.estado) params = params.set('estado', filters.estado);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
    }

    return this.http.get<AmenityListResponse>(this.apiUrl, { params });
  }

  getAmenityById(id: number): Observable<{ amenity: Amenity }> {
    return this.http.get<{ amenity: Amenity }>(`${this.apiUrl}/${id}`);
  }

  createAmenity(data: CreateAmenityData): Observable<{ message: string; amenity: Amenity }> {
    return this.http.post<{ message: string; amenity: Amenity }>(this.apiUrl, data);
  }

  updateAmenity(id: number, data: Partial<CreateAmenityData>): Observable<{ message: string; amenity: Amenity }> {
    return this.http.put<{ message: string; amenity: Amenity }>(`${this.apiUrl}/${id}`, data);
  }

  deleteAmenity(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  // Métodos de reserva
  reserveAmenity(id: number, data: ReserveAmenityData): Observable<{ message: string; amenity: Amenity; reservationInfo: any }> {
    return this.http.post<{ message: string; amenity: Amenity; reservationInfo: any }>(
      `${this.apiUrl}/${id}/reserve`,
      data
    );
  }

  releaseAmenity(id: number): Observable<{ message: string; amenity: Amenity }> {
    return this.http.post<{ message: string; amenity: Amenity }>(`${this.apiUrl}/${id}/release`, {});
  }

  checkAvailability(id: number): Observable<{ available: boolean; estado: string; message: string }> {
    return this.http.get<{ available: boolean; estado: string; message: string }>(
      `${this.apiUrl}/${id}/availability`
    );
  }
}