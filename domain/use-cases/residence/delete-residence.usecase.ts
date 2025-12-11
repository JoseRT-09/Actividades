import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ResidenceRepository } from '../../repositories/residence.repository';

@Injectable({
  providedIn: 'root'
})
export class DeleteResidenceUseCase {
  private residenceRepository = inject(ResidenceRepository);

  execute(id: number): Observable<void> {
    return this.residenceRepository.delete(id);
  }
}