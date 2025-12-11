import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { UserRepository } from '../../repositories/user.repository';

@Injectable({
  providedIn: 'root'
})
export class DeleteUserUseCase {
  private userRepository = inject(UserRepository);

  execute(id: number): Observable<void> {
    return this.userRepository.delete(id);
  }
}