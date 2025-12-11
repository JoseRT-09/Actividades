import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ReportRepository } from '../../repositories/report.repository';
import { Report } from '../../models/report.model';
import { PaginatedResponse, QueryParams } from '../../repositories/base.repository';

@Injectable({
  providedIn: 'root'
})
export class GetAllReportsUseCase {
  private reportRepository = inject(ReportRepository);

  execute(params?: QueryParams): Observable<PaginatedResponse<Report>> {
    return this.reportRepository.getAll(params);
  }
}