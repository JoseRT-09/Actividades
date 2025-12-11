import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivityRepository } from '../../repositories/activity.repository';
import { Activity } from '../../models/activity.model';

@Injectable({
  providedIn: 'root'
})
export class RegisterAttendanceUseCase {
  private activityRepository = inject(ActivityRepository);

  execute(activityId: number): Observable<Activity> {
    return this.activityRepository.registerAttendance(activityId);
  }
}