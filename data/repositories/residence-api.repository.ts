import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ResidenceRepository } from '../../domain/repositories/residence.repository';
import { PaginatedResponse, QueryParams } from '../../domain/repositories/base.repository';
import { 
  Residence, 
  CreateResidenceDto, 
  UpdateResidenceDto,
  AssignResidentDto,
  ReassignmentHistory 
} from '../../domain/models/residence.model';

@Injectable({
  providedIn: 'root'
})
export class ResidenceApiRepository extends ResidenceRepository {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/residences`;

  getAll(params?: QueryParams): Observable<PaginatedResponse<Residence>> {
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
        data: response.residences
      }))
    );
  }

  getById(id: number): Observable<Residence> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.residence)
    );
  }

  create(residence: CreateResidenceDto): Observable<Residence> {
    return this.http.post<any>(this.apiUrl, residence).pipe(
      map(response => response.residence)
    );
  }

  update(id: number, residence: UpdateResidenceDto): Observable<Residence> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, residence).pipe(
      map(response => response.residence)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  assignResident(id: number, data: AssignResidentDto): Observable<Residence> {
    return this.http.post<any>(`${this.apiUrl}/${id}/assign`, data).pipe(
      map(response => response.residence)
    );
  }

  getReassignmentHistory(id: number): Observable<ReassignmentHistory[]> {
    return this.http.get<any>(`${this.apiUrl}/${id}/history`).pipe(
      map(response => response.history)
    );
  }
}