import { Observable } from 'rxjs';
import { Complaint, CreateComplaintDto, UpdateComplaintDto } from '../models/complaint.model';
import { PaginatedResponse, QueryParams } from './base.repository';

export abstract class ComplaintRepository {
  abstract getAll(params?: QueryParams): Observable<PaginatedResponse<Complaint>>;
  abstract getById(id: number): Observable<Complaint>;
  abstract create(complaint: CreateComplaintDto): Observable<Complaint>;
  abstract update(id: number, complaint: UpdateComplaintDto): Observable<Complaint>;
  abstract delete(id: number): Observable<void>;
  abstract respond(id: number, response: string): Observable<Complaint>;
  abstract getByUser(userId: number): Observable<Complaint[]>;
}