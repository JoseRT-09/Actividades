import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AmenityRepository } from '../../repositories/amenity.repository';
import { Amenity } from '../../models/amenity.model';

@Injectable({
  providedIn: 'root'
})
export class GetAmenityByIdUseCase {
  private amenityRepository = inject(AmenityRepository);

  execute(id: number): Observable<Amenity> {
    return this.amenityRepository.getById(id);
  }
}
