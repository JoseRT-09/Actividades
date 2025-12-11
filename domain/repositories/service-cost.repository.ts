import { Observable } from 'rxjs';
import { ServiceCost, CreateServiceCostDto, UpdateServiceCostDto } from '../models/service-cost.model';
import { PaginatedResponse, QueryParams } from './base.repository';

export abstract class ServiceCostRepository {
  abstract getAll(params?: QueryParams): Observable<PaginatedResponse<ServiceCost>>;
  abstract getById(id: number): Observable<ServiceCost>;
  abstract create(serviceCost: CreateServiceCostDto): Observable<ServiceCost>;
  abstract update(id: number, serviceCost: UpdateServiceCostDto): Observable<ServiceCost>;
  abstract delete(id: number): Observable<void>;
  abstract getPendingByResidence(residenceId: number): Observable<{ pendingCosts: ServiceCost[], totalPending: number }>;
  abstract updateOverdue(): Observable<{ count: number }>;
}