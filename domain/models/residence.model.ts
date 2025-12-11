import { User } from './user.model';

export enum ResidenceStatus {
  OCUPADA = 'Ocupada',
  DISPONIBLE = 'Disponible',
  MANTENIMIENTO = 'Mantenimiento'
}

export enum PropertyType {
  RENTA = 'Renta',
  COMPRA = 'Compra'
}

export interface Residence {
  id: number;
  numero_unidad: string;
  bloque?: string;
  piso?: number;
  area_m2?: number;
  dueno_id?: number;
  residente_actual_id?: number;
  administrador_id?: number;
  fecha_asignacion?: Date;
  estado: ResidenceStatus;
  created_at?: Date;
  updated_at?: Date;
  habitaciones?: number;
  banos?: number;
  estacionamientos?: number;
  tipo_propiedad?: PropertyType;
  precio?: number;
  descripcion?: string;
  notas_adicionales?: string;

  // Relaciones
  dueno?: User;
  residenteActual?: User;
  administrador?: User;
}

export interface CreateResidenceDto {
  numero_unidad: string;
  bloque?: string;
  piso?: number;
  area_m2?: number;
  habitaciones?: number;
  banos?: number;
  estacionamientos?: number;
  tipo_propiedad?: PropertyType;
  precio?: number;
  descripcion?: string;
  notas_adicionales?: string;
  dueno_id?: number;
  residente_actual_id?: number;
  administrador_id?: number;
}

export interface UpdateResidenceDto {
  numero_unidad?: string;
  bloque?: string;
  piso?: number;
  area_m2?: number;
  habitaciones?: number;
  banos?: number;
  estacionamientos?: number;
  tipo_propiedad?: PropertyType;
  precio?: number;
  descripcion?: string;
  notas_adicionales?: string;
  estado?: ResidenceStatus;
  administrador_id?: number;
}

export enum ReassignmentType {
  VENTA = 'Venta',
  RENTA = 'Renta',
  CAMBIO_RESPONSABLE = 'Cambio Responsable',
  HERENCIA = 'Herencia',
  ASIGNACION = 'Asignación',
  CAMBIO = 'Cambio',
  LIBERACION = 'Liberación'
}

export interface AssignResidentDto {
  residente_nuevo_id: number;
  tipo_cambio: ReassignmentType;
  motivo?: string;
}

export interface ReassignmentHistory {
  id: number;
  residencia_id: number;
  residente_anterior_id?: number;
  residente_nuevo_id?: number;
  tipo_cambio: ReassignmentType;
  motivo?: string;
  fecha_cambio: Date;
  autorizado_por?: number;

  // Relaciones
  residenteAnterior?: User;
  residenteNuevo?: User;
  autorizadoPor?: User;
}