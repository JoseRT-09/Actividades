import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { UserRepository } from '../../domain/repositories/user.repository';
import { PaginatedResponse, QueryParams } from '../../domain/repositories/base.repository';
import { User, CreateUserDto, UpdateUserDto } from '../../domain/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserApiRepository extends UserRepository {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  getAll(params?: QueryParams): Observable<PaginatedResponse<User>> {
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
        data: response.users
      }))
    );
  }

  getById(id: number): Observable<User> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.user)
    );
  }

  create(user: CreateUserDto): Observable<User> {
    return this.http.post<any>(this.apiUrl, user).pipe(
      map(response => response.user)
    );
  }

  update(id: number, user: UpdateUserDto): Observable<User> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, user).pipe(
      map(response => response.user)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getActiveResidents(): Observable<User[]> {
    return this.http.get<any>(`${this.apiUrl}/residents/active`).pipe(
      map(response => response.residents)
    );
  }

  getAdministrators(): Observable<User[]> {
    return this.http.get<any>(`${this.apiUrl}/administrators/list`).pipe(
      map(response => response.administrators)
    );
  }
}