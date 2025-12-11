import { Observable } from 'rxjs';
import { 
  Residence, 
  CreateResidenceDto, 
  UpdateResidenceDto, 
  AssignResidentDto,
  ReassignmentHistory 
} from '../models/residence.model';
import { PaginatedResponse, QueryParams } from './base.repository';

export abstract class ResidenceRepository {
  abstract getAll(params?: QueryParams): Observable<PaginatedResponse<Residence>>;
  abstract getById(id: number): Observable<Residence>;
  abstract create(residence: CreateResidenceDto): Observable<Residence>;
  abstract update(id: number, residence: UpdateResidenceDto): Observable<Residence>;
  abstract delete(id: number): Observable<void>;
  abstract assignResident(id: number, data: AssignResidentDto): Observable<Residence>;
  abstract getReassignmentHistory(id: number): Observable<ReassignmentHistory[]>;
}