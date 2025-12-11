import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AmenityRepository } from '../../repositories/amenity.repository';

@Injectable({
  providedIn: 'root'
})
export class GetAvailableSlotsUseCase {
  private amenityRepository = inject(AmenityRepository);

  execute(amenityId: number, date: Date): Observable<any> {
    return this.amenityRepository.getAvailableSlots(amenityId, date);
  }
}