import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ComplaintRepository } from '../../domain/repositories/complaint.repository';
import { PaginatedResponse, QueryParams } from '../../domain/repositories/base.repository';
import { Complaint, CreateComplaintDto, UpdateComplaintDto } from '../../domain/models/complaint.model';

@Injectable({
  providedIn: 'root'
})
export class ComplaintApiRepository extends ComplaintRepository {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/complaints`;

  getAll(params?: QueryParams): Observable<PaginatedResponse<Complaint>> {
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
        data: response.complaints
      }))
    );
  }

  getById(id: number): Observable<Complaint> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.complaint)
    );
  }

  create(complaint: CreateComplaintDto): Observable<Complaint> {
    return this.http.post<any>(this.apiUrl, complaint).pipe(
      map(response => response.complaint)
    );
  }

  update(id: number, complaint: UpdateComplaintDto): Observable<Complaint> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, complaint).pipe(
      map(response => response.complaint)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  respond(id: number, response: string): Observable<Complaint> {
    return this.http.post<any>(`${this.apiUrl}/${id}/respond`, { respuesta: response }).pipe(
      map(res => res.complaint)
    );
  }

  getByUser(userId: number): Observable<Complaint[]> {
    return this.http.get<any>(`${this.apiUrl}/user/${userId}`).pipe(
      map(response => response.complaints)
    );
  }
}