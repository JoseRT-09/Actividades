import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivityRepository } from '../../repositories/activity.repository';
import { Activity, UpdateActivityDto } from '../../models/activity.model';

@Injectable({
  providedIn: 'root'
})
export class UpdateActivityUseCase {
  private activityRepository = inject(ActivityRepository);

  execute(id: number, activity: UpdateActivityDto): Observable<Activity> {
    return this.activityRepository.update(id, activity);
  }
}