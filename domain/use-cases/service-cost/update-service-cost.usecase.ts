import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ServiceCostRepository } from '../../repositories/service-cost.repository';
import { ServiceCost, UpdateServiceCostDto } from '../../models/service-cost.model';

@Injectable({
  providedIn: 'root'
})
export class UpdateServiceCostUseCase {
  private serviceCostRepository = inject(ServiceCostRepository);

  execute(id: number, serviceCost: UpdateServiceCostDto): Observable<ServiceCost> {
    return this.serviceCostRepository.update(id, serviceCost);
  }
}