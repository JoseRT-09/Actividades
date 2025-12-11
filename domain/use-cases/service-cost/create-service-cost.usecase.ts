import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ServiceCostRepository } from '../../repositories/service-cost.repository';
import { ServiceCost, CreateServiceCostDto } from '../../models/service-cost.model';

@Injectable({
  providedIn: 'root'
})
export class CreateServiceCostUseCase {
  private serviceCostRepository = inject(ServiceCostRepository);

  execute(serviceCost: CreateServiceCostDto): Observable<ServiceCost> {
    return this.serviceCostRepository.create(serviceCost);
  }
}