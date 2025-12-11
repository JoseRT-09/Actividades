import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivityRepository } from '../../repositories/activity.repository';
import { Activity } from '../../models/activity.model';

@Injectable({
  providedIn: 'root'
})
export class GetActivityByIdUseCase {
  private activityRepository = inject(ActivityRepository);

  execute(id: number): Observable<Activity> {
    return this.activityRepository.getById(id);
  }
}