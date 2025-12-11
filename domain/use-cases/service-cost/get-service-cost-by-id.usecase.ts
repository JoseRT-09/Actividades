import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ServiceCostRepository } from '../../repositories/service-cost.repository';
import { ServiceCost } from '../../models/service-cost.model';

@Injectable({
  providedIn: 'root'
})
export class GetServiceCostByIdUseCase {
  private serviceCostRepository = inject(ServiceCostRepository);

  execute(id: number): Observable<ServiceCost> {
    return this.serviceCostRepository.getById(id);
  }
}