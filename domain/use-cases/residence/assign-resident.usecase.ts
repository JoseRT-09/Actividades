import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ResidenceRepository } from '../../repositories/residence.repository';
import { Residence, AssignResidentDto } from '../../models/residence.model';

@Injectable({
  providedIn: 'root'
})
export class AssignResidentUseCase {
  private residenceRepository = inject(ResidenceRepository);

  execute(residenceId: number, data: AssignResidentDto): Observable<Residence> {
    return this.residenceRepository.assignResident(residenceId, data);
  }
}