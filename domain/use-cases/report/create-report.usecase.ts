import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ReportRepository } from '../../repositories/report.repository';
import { Report, CreateReportDto } from '../../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class CreateReportUseCase {
  private reportRepository = inject(ReportRepository);

  execute(report: CreateReportDto): Observable<Report> {
    return this.reportRepository.create(report);
  }
}