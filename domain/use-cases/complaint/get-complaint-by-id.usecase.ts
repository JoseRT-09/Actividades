import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ComplaintRepository } from '../../repositories/complaint.repository';
import { Complaint } from '../../models/complaint.model';

@Injectable({
  providedIn: 'root'
})
export class GetComplaintByIdUseCase {
  private complaintRepository = inject(ComplaintRepository);

  execute(id: number): Observable<Complaint> {
    return this.complaintRepository.getById(id);
  }
}
