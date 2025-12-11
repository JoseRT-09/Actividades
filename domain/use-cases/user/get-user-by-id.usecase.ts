import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { UserRepository } from '../../repositories/user.repository';
import { User } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class GetUserByIdUseCase {
  private userRepository = inject(UserRepository);

  execute(id: number): Observable<User> {
    return this.userRepository.getById(id);
  }
}