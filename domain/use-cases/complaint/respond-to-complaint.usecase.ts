import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ComplaintRepository } from '../../repositories/complaint.repository';
import { Complaint } from '../../models/complaint.model';

@Injectable({
  providedIn: 'root'
})
export class RespondToComplaintUseCase {
  private complaintRepository = inject(ComplaintRepository);

  execute(complaintId: number, response: string): Observable<Complaint> {
    return this.complaintRepository.respond(complaintId, response);
  }
}
