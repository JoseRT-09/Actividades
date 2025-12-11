import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AmenityRepository } from '../../repositories/amenity.repository';
import { AmenityReservation } from '../../models/amenity.model';
import { PaginatedResponse, QueryParams } from '../../repositories/base.repository';

@Injectable({
  providedIn: 'root'
})
export class GetAllReservationsUseCase {
  private amenityRepository = inject(AmenityRepository);

  execute(params?: QueryParams): Observable<PaginatedResponse<AmenityReservation>> {
    return this.amenityRepository.getAllReservations(params);
  }
}