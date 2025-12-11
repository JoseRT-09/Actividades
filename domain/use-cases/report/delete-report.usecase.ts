import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ReportRepository } from '../../repositories/report.repository';

@Injectable({
  providedIn: 'root'
})
export class DeleteReportUseCase {
  private reportRepository = inject(ReportRepository);

  execute(id: number): Observable<void> {
    return this.reportRepository.delete(id);
  }
}