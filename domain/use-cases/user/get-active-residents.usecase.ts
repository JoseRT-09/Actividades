import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { UserRepository } from '../../repositories/user.repository';
import { User } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class GetActiveResidentsUseCase {
  private userRepository = inject(UserRepository);

  execute(): Observable<User[]> {
    return this.userRepository.getActiveResidents();
  }
}