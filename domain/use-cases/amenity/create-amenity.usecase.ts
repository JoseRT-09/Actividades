import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AmenityRepository } from '../../repositories/amenity.repository';
import { Amenity, CreateAmenityDto } from '../../models/amenity.model';

@Injectable({
  providedIn: 'root'
})
export class CreateAmenityUseCase {
  private amenityRepository = inject(AmenityRepository);

  execute(amenity: CreateAmenityDto): Observable<Amenity> {
    return this.amenityRepository.create(amenity);
  }
}