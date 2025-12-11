import { Observable } from 'rxjs';
import { 
  Amenity, 
  CreateAmenityDto, 
  UpdateAmenityDto,
  AmenityReservation,
  CreateReservationDto 
} from '../models/amenity.model';
import { PaginatedResponse, QueryParams } from './base.repository';

export abstract class AmenityRepository {
  abstract getAll(params?: QueryParams): Observable<PaginatedResponse<Amenity>>;
  abstract getById(id: number): Observable<Amenity>;
  abstract create(amenity: CreateAmenityDto): Observable<Amenity>;
  abstract update(id: number, amenity: UpdateAmenityDto): Observable<Amenity>;
  abstract delete(id: number): Observable<void>;
  
  // Reservations
  abstract getAllReservations(params?: QueryParams): Observable<PaginatedResponse<AmenityReservation>>;
  abstract createReservation(reservation: CreateReservationDto): Observable<AmenityReservation>;
  abstract updateReservationStatus(id: number, status: string): Observable<AmenityReservation>;
  abstract cancelReservation(id: number): Observable<AmenityReservation>;
  abstract getAvailableSlots(amenityId: number, date: Date): Observable<any>;
}