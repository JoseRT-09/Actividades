import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivityRepository } from '../../repositories/activity.repository';
import { Activity } from '../../models/activity.model';
import { PaginatedResponse, QueryParams } from '../../repositories/base.repository';

@Injectable({
  providedIn: 'root'
})
export class GetAllActivitiesUseCase {
  private activityRepository = inject(ActivityRepository);

  execute(params?: QueryParams): Observable<PaginatedResponse<Activity>> {
    return this.activityRepository.getAll(params);
  }
}