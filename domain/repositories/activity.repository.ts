import { Observable } from 'rxjs';
import { Activity, CreateActivityDto, UpdateActivityDto } from '../models/activity.model';
import { PaginatedResponse, QueryParams } from './base.repository';

export abstract class ActivityRepository {
  abstract getAll(params?: QueryParams): Observable<PaginatedResponse<Activity>>;
  abstract getById(id: number): Observable<Activity>;
  abstract create(activity: CreateActivityDto): Observable<Activity>;
  abstract update(id: number, activity: UpdateActivityDto): Observable<Activity>;
  abstract delete(id: number): Observable<void>;
  abstract cancel(id: number): Observable<Activity>;
  abstract getUpcoming(): Observable<Activity[]>;
  abstract registerAttendance(id: number): Observable<Activity>;
}