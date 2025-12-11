import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ReportRepository } from '../../repositories/report.repository';
import { Report } from '../../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class GetReportsByUserUseCase {
  private reportRepository = inject(ReportRepository);

  execute(userId: number): Observable<Report[]> {
    return this.reportRepository.getByUser(userId);
  }
}