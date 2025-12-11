import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AmenityRepository } from '../../domain/repositories/amenity.repository';
import { PaginatedResponse, QueryParams } from '../../domain/repositories/base.repository';
import { 
  Amenity, 
  CreateAmenityDto, 
  UpdateAmenityDto,
  AmenityReservation,
  CreateReservationDto 
} from '../../domain/models/amenity.model';

@Injectable({
  providedIn: 'root'
})
export class AmenityApiRepository extends AmenityRepository {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/amenities`;

  getAll(params?: QueryParams): Observable<PaginatedResponse<Amenity>> {
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
        data: response.amenities
      }))
    );
  }

  getById(id: number): Observable<Amenity> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.amenity)
    );
  }

  create(amenity: CreateAmenityDto): Observable<Amenity> {
    return this.http.post<any>(this.apiUrl, amenity).pipe(
      map(response => response.amenity)
    );
  }

  update(id: number, amenity: UpdateAmenityDto): Observable<Amenity> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, amenity).pipe(
      map(response => response.amenity)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getAllReservations(params?: QueryParams): Observable<PaginatedResponse<AmenityReservation>> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }

    return this.http.get<any>(`${this.apiUrl}/reservations/all`, { params: httpParams }).pipe(
      map(response => ({
        total: response.total,
        pages: response.pages,
        currentPage: response.currentPage,
        data: response.reservations
      }))
    );
  }

  createReservation(reservation: CreateReservationDto): Observable<AmenityReservation> {
    return this.http.post<any>(`${this.apiUrl}/reservations`, reservation).pipe(
      map(response => response.reservation)
    );
  }

  updateReservationStatus(id: number, status: string): Observable<AmenityReservation> {
    return this.http.put<any>(`${this.apiUrl}/reservations/${id}/status`, { estado: status }).pipe(
      map(response => response.reservation)
    );
  }

  cancelReservation(id: number): Observable<AmenityReservation> {
    return this.http.post<any>(`${this.apiUrl}/reservations/${id}/cancel`, {}).pipe(
      map(response => response.reservation)
    );
  }

  getAvailableSlots(amenityId: number, date: Date): Observable<any> {
    const dateStr = date.toISOString().split('T')[0];
    const params = new HttpParams()
      .set('amenidad_id', amenityId.toString())
      .set('fecha_reserva', dateStr);
    
    return this.http.get<any>(`${this.apiUrl}/reservations/available-slots`, { params });
  }
}