import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { UserRepository } from '../../repositories/user.repository';
import { User, UpdateUserDto } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UpdateUserUseCase {
  private userRepository = inject(UserRepository);

  execute(id: number, user: UpdateUserDto): Observable<User> {
    return this.userRepository.update(id, user);
  }
}