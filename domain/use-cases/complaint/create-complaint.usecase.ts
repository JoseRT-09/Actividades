import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ComplaintRepository } from '../../repositories/complaint.repository';
import { Complaint, CreateComplaintDto } from '../../models/complaint.model';

@Injectable({
  providedIn: 'root'
})
export class CreateComplaintUseCase {
  private complaintRepository = inject(ComplaintRepository);

  execute(complaint: CreateComplaintDto): Observable<Complaint> {
    return this.complaintRepository.create(complaint);
  }
}