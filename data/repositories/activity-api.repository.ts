import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ActivityRepository } from '../../domain/repositories/activity.repository';
import { PaginatedResponse, QueryParams } from '../../domain/repositories/base.repository';
import { Activity, CreateActivityDto, UpdateActivityDto } from '../../domain/models/activity.model';

@Injectable({
  providedIn: 'root'
})
export class ActivityApiRepository extends ActivityRepository {
  
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/activities`;

  getAll(params?: QueryParams): Observable<PaginatedResponse<Activity>> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }

    console.log("ðŸ“¤ [Repository] Enviando GET /activities con params:", params);

    return this.http.get<any>(this.apiUrl, { params: httpParams }).pipe(

      tap(resp => {
        console.log("ðŸ“¥ [Repository] RAW response desde backend:", resp);
      }),

      map(response => {
        console.log("ðŸ” [Repository] Mapeando respuesta...");

        if (!response) {
          console.error("âŒ Backend devolviÃ³ NULL/undefined");
        }

        if (!Array.isArray(response.data)) {
          console.error("âŒ 'data' no es array en backend:", response.data);
        } else {
          console.log("ðŸ“Œ Total actividades recibidas:", response.data.length);
        }

        return {
          total: response.total ?? 0,
          pages: response.pages ?? 1,
          currentPage: response.currentPage ?? 1,
          data: response.data ?? []   // <-- CORREGIDO (antes: response.activities)
        };
      })
    );
  }

  getById(id: number): Observable<Activity> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(resp => console.log("ðŸ“¥ [Repository] GET BY ID response:", resp)),
      map(response => response.activity)
    );
  }

  create(activity: CreateActivityDto): Observable<Activity> {
    return this.http.post<any>(this.apiUrl, activity).pipe(
      tap(resp => console.log("ðŸ“¤ [Repository] CREATE response:", resp)),
      map(response => response.activity)
    );
  }

  update(id: number, activity: UpdateActivityDto): Observable<Activity> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, activity).pipe(
      tap(resp => console.log("ðŸ“¤ [Repository] UPDATE response:", resp)),
      map(response => response.activity)
    );
  }

  delete(id: number): Observable<void> {
    console.log(`ðŸ—‘ [Repository] DELETE /${id}`);
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  cancel(id: number): Observable<Activity> {
    return this.http.post<any>(`${this.apiUrl}/${id}/cancel`, {}).pipe(
      tap(resp => console.log("ðŸ“¥ [Repository] CANCEL response:", resp)),
      map(response => response.activity)
    );
  }

  getUpcoming(): Observable<Activity[]> {
    return this.http.get<any>(`${this.apiUrl}/upcoming/list`).pipe(
      tap(resp => console.log("ðŸ“¥ [Repository] UPCOMING response:", resp)),
      map(response => response.activities)
    );
  }

  registerAttendance(id: number): Observable<Activity> {
    return this.http.post<any>(`${this.apiUrl}/${id}/register`, {}).pipe(
      tap(resp => console.log("ðŸ“¥ [Repository] REGISTER response:", resp)),
      map(response => response.activity)
    );
  }
}