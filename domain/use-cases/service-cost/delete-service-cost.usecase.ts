import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ServiceCostRepository } from '../../repositories/service-cost.repository';

@Injectable({
  providedIn: 'root'
})
export class DeleteServiceCostUseCase {
  private serviceCostRepository = inject(ServiceCostRepository);

  execute(id: number): Observable<void> {
    return this.serviceCostRepository.delete(id);
  }
}