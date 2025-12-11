import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ResidenceRepository } from '../../repositories/residence.repository';
import { Residence, CreateResidenceDto } from '../../models/residence.model';

@Injectable({
  providedIn: 'root'
})
export class CreateResidenceUseCase {
  private residenceRepository = inject(ResidenceRepository);

  execute(residence: CreateResidenceDto): Observable<Residence> {
    return this.residenceRepository.create(residence);
  }
}