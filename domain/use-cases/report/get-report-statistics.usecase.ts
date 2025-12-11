import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ReportRepository } from '../../repositories/report.repository';
import { ReportStatistics } from '../../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class GetReportStatisticsUseCase {
  private reportRepository = inject(ReportRepository);

  execute(): Observable<ReportStatistics> {
    return this.reportRepository.getStatistics();
  }
}