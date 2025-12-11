import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { UserRepository } from '../../repositories/user.repository';
import { User, CreateUserDto } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class CreateUserUseCase {
  private userRepository = inject(UserRepository);

  execute(user: CreateUserDto): Observable<User> {
    return this.userRepository.create(user);
  }
}