import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ComplaintRepository } from '../../repositories/complaint.repository';

@Injectable({
  providedIn: 'root'
})
export class DeleteComplaintUseCase {
  private complaintRepository = inject(ComplaintRepository);

  execute(id: number): Observable<void> {
    return this.complaintRepository.delete(id);
  }
}
