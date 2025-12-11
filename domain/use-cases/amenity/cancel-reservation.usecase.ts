import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AmenityRepository } from '../../repositories/amenity.repository';
import { AmenityReservation } from '../../models/amenity.model';

@Injectable({
  providedIn: 'root'
})
export class CancelReservationUseCase {
  private amenityRepository = inject(AmenityRepository);

  execute(reservationId: number): Observable<AmenityReservation> {
    return this.amenityRepository.cancelReservation(reservationId);
  }
}