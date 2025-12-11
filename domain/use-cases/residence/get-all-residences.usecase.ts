import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ResidenceRepository } from '../../repositories/residence.repository';
import { Residence } from '../../models/residence.model';
import { PaginatedResponse, QueryParams } from '../../repositories/base.repository';

@Injectable({
  providedIn: 'root'
})
export class GetAllResidencesUseCase {
  private residenceRepository = inject(ResidenceRepository);

  execute(params?: QueryParams): Observable<PaginatedResponse<Residence>> {
    return this.residenceRepository.getAll(params);
  }
}