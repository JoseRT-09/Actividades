import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ServiceCostRepository } from '../../repositories/service-cost.repository';
import { ServiceCost } from '../../models/service-cost.model';
import { PaginatedResponse, QueryParams } from '../../repositories/base.repository';

@Injectable({
  providedIn: 'root'
})
export class GetAllServiceCostsUseCase {
  private serviceCostRepository = inject(ServiceCostRepository);

  execute(params?: QueryParams): Observable<PaginatedResponse<ServiceCost>> {
    return this.serviceCostRepository.getAll(params);
  }
}