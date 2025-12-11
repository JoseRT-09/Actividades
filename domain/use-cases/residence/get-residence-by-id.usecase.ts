import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ResidenceRepository } from '../../repositories/residence.repository';
import { Residence } from '../../models/residence.model';

@Injectable({
  providedIn: 'root'
})
export class GetResidenceByIdUseCase {
  private residenceRepository = inject(ResidenceRepository);

  execute(id: number): Observable<Residence> {
    return this.residenceRepository.getById(id);
  }
}