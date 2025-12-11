import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AmenityRepository } from '../../repositories/amenity.repository';

@Injectable({
  providedIn: 'root'
})
export class DeleteAmenityUseCase {
  private amenityRepository = inject(AmenityRepository);

  execute(id: number): Observable<void> {
    return this.amenityRepository.delete(id);
  }
}