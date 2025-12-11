import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AmenityRepository } from '../../repositories/amenity.repository';
import { Amenity, UpdateAmenityDto } from '../../models/amenity.model';

@Injectable({
  providedIn: 'root'
})
export class UpdateAmenityUseCase {
  private amenityRepository = inject(AmenityRepository);

  execute(id: number, amenity: UpdateAmenityDto): Observable<Amenity> {
    return this.amenityRepository.update(id, amenity);
  }
}