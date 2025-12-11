import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ResidenceRepository } from '../../repositories/residence.repository';
import { ReassignmentHistory } from '../../models/residence.model';

@Injectable({
  providedIn: 'root'
})
export class GetReassignmentHistoryUseCase {
  private residenceRepository = inject(ResidenceRepository);

  execute(residenceId: number): Observable<ReassignmentHistory[]> {
    return this.residenceRepository.getReassignmentHistory(residenceId);
  }
}