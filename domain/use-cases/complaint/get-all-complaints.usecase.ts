import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ComplaintRepository } from '../../repositories/complaint.repository';
import { Complaint } from '../../models/complaint.model';
import { PaginatedResponse, QueryParams } from '../../repositories/base.repository';

@Injectable({
  providedIn: 'root'
})
export class GetAllComplaintsUseCase {
  private complaintRepository = inject(ComplaintRepository);

  execute(params?: QueryParams): Observable<PaginatedResponse<Complaint>> {
    return this.complaintRepository.getAll(params);
  }
}