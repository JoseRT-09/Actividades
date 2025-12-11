import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ServiceCostRepository } from '../../domain/repositories/service-cost.repository';
import { PaginatedResponse, QueryParams } from '../../domain/repositories/base.repository';
import { ServiceCost, CreateServiceCostDto, UpdateServiceCostDto } from '../../domain/models/service-cost.model';

@Injectable({
  providedIn: 'root'
})
export class ServiceCostApiRepository extends ServiceCostRepository {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/service-costs`;

  getAll(params?: QueryParams): Observable<PaginatedResponse<ServiceCost>> {
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
        data: response.serviceCosts
      }))
    );
  }

  getById(id: number): Observable<ServiceCost> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.serviceCost)
    );
  }

  create(serviceCost: CreateServiceCostDto): Observable<ServiceCost> {
    return this.http.post<any>(this.apiUrl, serviceCost).pipe(
      map(response => response.serviceCost)
    );
  }

  update(id: number, serviceCost: UpdateServiceCostDto): Observable<ServiceCost> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, serviceCost).pipe(
      map(response => response.serviceCost)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getPendingByResidence(residenceId: number): Observable<{ pendingCosts: ServiceCost[], totalPending: number }> {
    return this.http.get<any>(`${this.apiUrl}/residence/${residenceId}/pending`);
  }

  updateOverdue(): Observable<{ count: number }> {
    return this.http.post<any>(`${this.apiUrl}/update-overdue`, {});
  }
}