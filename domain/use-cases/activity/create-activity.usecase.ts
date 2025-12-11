import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivityRepository } from '../../repositories/activity.repository';
import { Activity, CreateActivityDto } from '../../models/activity.model';

@Injectable({
  providedIn: 'root'
})
export class CreateActivityUseCase {
  private activityRepository = inject(ActivityRepository);

  execute(activity: CreateActivityDto): Observable<Activity> {
    return this.activityRepository.create(activity);
  }
}