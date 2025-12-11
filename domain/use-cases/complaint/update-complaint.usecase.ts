import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ComplaintRepository } from '../../repositories/complaint.repository';
import { Complaint, UpdateComplaintDto } from '../../models/complaint.model';

@Injectable({
  providedIn: 'root'
})
export class UpdateComplaintUseCase {
  private complaintRepository = inject(ComplaintRepository);

  execute(id: number, complaint: UpdateComplaintDto): Observable<Complaint> {
    return this.complaintRepository.update(id, complaint);
  }
}
