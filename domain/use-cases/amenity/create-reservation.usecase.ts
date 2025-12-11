import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AmenityRepository } from '../../repositories/amenity.repository';
import { AmenityReservation, CreateReservationDto } from '../../models/amenity.model';

@Injectable({
  providedIn: 'root'
})
export class CreateReservationUseCase {
  private amenityRepository = inject(AmenityRepository);

  execute(reservation: CreateReservationDto): Observable<AmenityReservation> {
    return this.amenityRepository.createReservation(reservation);
  }
}