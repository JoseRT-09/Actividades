import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ReportRepository } from '../../domain/repositories/report.repository';
import { PaginatedResponse, QueryParams } from '../../domain/repositories/base.repository';
import { Report, CreateReportDto, UpdateReportDto, ReportStatistics } from '../../domain/models/report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportApiRepository extends ReportRepository {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reports`;

  getAll(params?: QueryParams): Observable<PaginatedResponse<Report>> {
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
        data: response.reports
      }))
    );
  }

  getById(id: number): Observable<Report> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.report)
    );
  }

  create(report: CreateReportDto): Observable<Report> {
    return this.http.post<any>(this.apiUrl, report).pipe(
      map(response => response.report)
    );
  }

  update(id: number, report: UpdateReportDto): Observable<Report> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, report).pipe(
      map(response => response.report)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  assign(id: number, adminId: number): Observable<Report> {
    return this.http.post<any>(`${this.apiUrl}/${id}/assign`, { asignado_a: adminId }).pipe(
      map(response => response.report)
    );
  }

  getByUser(userId: number): Observable<Report[]> {
    return this.http.get<any>(`${this.apiUrl}/user/${userId}`).pipe(
      map(response => response.reports)
    );
  }

  getStatistics(): Observable<ReportStatistics> {
    return this.http.get<ReportStatistics>(`${this.apiUrl}/statistics/summary`);
  }
}