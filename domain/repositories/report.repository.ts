import { Observable } from 'rxjs';
import { Report, CreateReportDto, UpdateReportDto, ReportStatistics } from '../models/report.model';
import { PaginatedResponse, QueryParams } from './base.repository';

export abstract class ReportRepository {
  abstract getAll(params?: QueryParams): Observable<PaginatedResponse<Report>>;
  abstract getById(id: number): Observable<Report>;
  abstract create(report: CreateReportDto): Observable<Report>;
  abstract update(id: number, report: UpdateReportDto): Observable<Report>;
  abstract delete(id: number): Observable<void>;
  abstract assign(id: number, adminId: number): Observable<Report>;
  abstract getByUser(userId: number): Observable<Report[]>;
  abstract getStatistics(): Observable<ReportStatistics>;
}