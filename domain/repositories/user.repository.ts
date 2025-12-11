import { Observable } from 'rxjs';
import { User, CreateUserDto, UpdateUserDto } from '../models/user.model';
import { PaginatedResponse, QueryParams } from './base.repository';

export abstract class UserRepository {
  abstract getAll(params?: QueryParams): Observable<PaginatedResponse<User>>;
  abstract getById(id: number): Observable<User>;
  abstract create(user: CreateUserDto): Observable<User>;
  abstract update(id: number, user: UpdateUserDto): Observable<User>;
  abstract delete(id: number): Observable<void>;
  abstract getActiveResidents(): Observable<User[]>;
  abstract getAdministrators(): Observable<User[]>;
}