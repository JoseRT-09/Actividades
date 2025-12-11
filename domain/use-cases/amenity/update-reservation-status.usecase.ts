import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AmenityRepository } from '../../repositories/amenity.repository';
import { AmenityReservation } from '../../models/amenity.model';

@Injectable({
  providedIn: 'root'
})
export class UpdateReservationStatusUseCase {
  private amenityRepository = inject(AmenityRepository);

  execute(reservationId: number, status: string): Observable<AmenityReservation> {
    return this.amenityRepository.updateReservationStatus(reservationId, status);
  }
}