import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ResidenceRepository } from '../../repositories/residence.repository';
import { Residence, UpdateResidenceDto } from '../../models/residence.model';

@Injectable({
  providedIn: 'root'
})
export class UpdateResidenceUseCase {
  private residenceRepository = inject(ResidenceRepository);

  execute(id: number, residence: UpdateResidenceDto): Observable<Residence> {
    return this.residenceRepository.update(id, residence);
  }
}