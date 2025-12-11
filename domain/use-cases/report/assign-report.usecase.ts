import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ReportRepository } from '../../repositories/report.repository';
import { Report } from '../../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class AssignReportUseCase {
  private reportRepository = inject(ReportRepository);

  execute(reportId: number, adminId: number): Observable<Report> {
    return this.reportRepository.assign(reportId, adminId);
  }
}