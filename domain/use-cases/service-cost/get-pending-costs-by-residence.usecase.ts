import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ServiceCostRepository } from '../../repositories/service-cost.repository';
import { ServiceCost } from '../../models/service-cost.model';

@Injectable({
  providedIn: 'root'
})
export class GetPendingCostsByResidenceUseCase {
  private serviceCostRepository = inject(ServiceCostRepository);

  execute(residenceId: number): Observable<{ pendingCosts: ServiceCost[], totalPending: number }> {
    return this.serviceCostRepository.getPendingByResidence(residenceId);
  }
}