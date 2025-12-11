import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AmenityRepository } from '../../repositories/amenity.repository';
import { Amenity } from '../../models/amenity.model';
import { PaginatedResponse, QueryParams } from '../../repositories/base.repository';

@Injectable({
  providedIn: 'root'
})
export class GetAllAmenitiesUseCase {
  private amenityRepository = inject(AmenityRepository);

  execute(params?: QueryParams): Observable<PaginatedResponse<Amenity>> {
    return this.amenityRepository.getAll(params);
  }
}