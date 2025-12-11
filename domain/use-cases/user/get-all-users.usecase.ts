import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { UserRepository } from '../../repositories/user.repository';
import { User } from '../../models/user.model';
import { PaginatedResponse, QueryParams } from '../../repositories/base.repository';

@Injectable({
  providedIn: 'root'
})
export class GetAllUsersUseCase {
  private userRepository = inject(UserRepository);

  execute(params?: QueryParams): Observable<PaginatedResponse<User>> {
    return this.userRepository.getAll(params);
  }
}