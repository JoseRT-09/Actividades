import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivityRepository } from '../../repositories/activity.repository';
import { Activity } from '../../models/activity.model';

@Injectable({
  providedIn: 'root'
})
export class GetUpcomingActivitiesUseCase {
  private activityRepository = inject(ActivityRepository);

  execute(): Observable<Activity[]> {
    return this.activityRepository.getUpcoming();
  }
}