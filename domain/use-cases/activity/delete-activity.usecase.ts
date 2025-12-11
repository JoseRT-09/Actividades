import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivityRepository } from '../../repositories/activity.repository';

@Injectable({
  providedIn: 'root'
})
export class DeleteActivityUseCase {
  private activityRepository = inject(ActivityRepository);

  execute(id: number): Observable<void> {
    return this.activityRepository.delete(id);
  }
}