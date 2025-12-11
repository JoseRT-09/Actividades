import { User } from './user.model';
import { Residence } from './residence.model';

export enum AmenityType {
  SALON_EVENTOS = 'Salón de Eventos',
  GIMNASIO = 'Gimnasio',
  PISCINA = 'Piscina',
  CANCHA_DEPORTIVA = 'Cancha Deportiva',
  AREA_BBQ = 'Área BBQ',
  SALON_JUEGOS = 'Salón de Juegos',
  AREA_INFANTIL = 'Área Infantil',
  OTRO = 'Otro'
}

export enum AmenityStatus {
  DISPONIBLE = 'Disponible',
  OCUPADA = 'Ocupada',
  MANTENIMIENTO = 'Mantenimiento',
  FUERA_SERVICIO = 'Fuera de Servicio'
}

export enum ReservationStatus {
  PENDIENTE = 'Pendiente',
  CONFIRMADA = 'Confirmada',
  CANCELADA = 'Cancelada',
  COMPLETADA = 'Completada'
}

export interface Amenity {
  id: number;
  nombre: string;
  descripcion?: string;
  tipo: AmenityType;
  ubicacion?: string;
  capacidad?: number;
  capacidad_maxima?: number; 
  horario_apertura?: string;
  horario_inicio?: string; 
  horario_cierre?: string;
  horario_fin?: string; 
  requiere_reserva: boolean;
  disponible_reserva?: boolean; 
  costo_uso: number;
  costo_reserva?: number; 
  estado: AmenityStatus;
  imagen_url?: string;
  reglas?: string;
  requiere_aprobacion?: boolean;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface CreateAmenityDto {
  nombre: string;
  descripcion?: string;
  tipo: AmenityType;
  ubicacion?: string;
  capacidad?: number;
  capacidad_maxima?: number;
  horario_apertura?: string;
  horario_inicio?: string;
  horario_cierre?: string;
  horario_fin?: string;
  requiere_reserva?: boolean;
  disponible_reserva?: boolean;
  costo_uso?: number;
  costo_reserva?: number;
  estado?: AmenityStatus;
  imagen_url?: string;
  reglas?: string;
  requiere_aprobacion?: boolean;
}

export interface UpdateAmenityDto {
  nombre?: string;
  descripcion?: string;
  tipo?: AmenityType;
  ubicacion?: string;
  capacidad?: number;
  capacidad_maxima?: number;
  estado?: AmenityStatus;
  horario_apertura?: string;
  horario_inicio?: string;
  horario_cierre?: string;
  horario_fin?: string;
  requiere_reserva?: boolean;
  disponible_reserva?: boolean;
  costo_uso?: number;
  costo_reserva?: number;
  imagen_url?: string;
  reglas?: string;
  requiere_aprobacion?: boolean;
}

export interface AmenityReservation {
  id: number;
  amenidad_id: number;
  residente_id: number;
  fecha_reserva: Date | string;
  hora_inicio: string;
  hora_fin: string;
  estado: ReservationStatus;
  motivo?: string;
  created_at?: Date | string;
  
  // Relaciones
  Amenity?: Amenity;
  amenidad?: Amenity; 
  residente?: User;
  Residence?: Residence;
}

export interface CreateReservationDto {
  amenidad_id: number;
  fecha_reserva: Date | string;
  hora_inicio: string;
  hora_fin: string;
  motivo?: string;
}