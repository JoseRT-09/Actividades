import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ReportRepository } from '../../repositories/report.repository';
import { Report, UpdateReportDto } from '../../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class UpdateReportUseCase {
  private reportRepository = inject(ReportRepository);

  execute(id: number, report: UpdateReportDto): Observable<Report> {
    return this.reportRepository.update(id, report);
  }
}