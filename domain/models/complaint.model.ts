import { User } from './user.model';
import { Residence } from './residence.model';

export enum ComplaintTarget {
  ADMINISTRACION = 'Administración',
  RESIDENTE = 'Residente',
  MANTENIMIENTO = 'Mantenimiento'
}

export enum ComplaintStatus {
  NUEVO = 'Nuevo',
  REVISADO = 'Revisado',
  EN_PROCESO = 'En Proceso',
  RESUELTO = 'Resuelto'
}

export enum ComplaintCategory {
  RUIDO = 'Ruido',
  CONVIVENCIA = 'Convivencia',
  MASCOTAS = 'Mascotas',
  ESTACIONAMIENTO = 'Estacionamiento',
  AREAS_COMUNES = 'Áreas Comunes',
  LIMPIEZA = 'Limpieza',
  SEGURIDAD = 'Seguridad',
  MANTENIMIENTO = 'Mantenimiento',
  ADMINISTRACION = 'Administración',
  OTRO = 'Otro'
}

export enum ComplaintPriority {
  BAJA = 'Baja',
  MEDIA = 'Media',
  ALTA = 'Alta',
  URGENTE = 'Urgente'
}

export interface Complaint {
  id: number;
  autor_id: number;
  usuario_id?: number; // Alias para autor_id
  asunto: string;
  dirigido_a: ComplaintTarget;
  residente_objetivo_id?: number;
  residencia_id?: number;
  cuerpo_mensaje: string;
  descripcion?: string; // Alias para cuerpo_mensaje
  es_anonima: boolean;
  es_anonimo?: boolean; // Alias para es_anonima
  estado: ComplaintStatus;
  categoria: ComplaintCategory;
  prioridad: ComplaintPriority;
  respuesta?: string;
  fecha_queja: Date | string;
  created_at?: Date | string;
  updated_at?: Date | string;
  
  // Relaciones
  autor?: User;
  usuario?: User; // Alias para autor
  residenteObjetivo?: User;
  residencia?: Residence;
}

export interface CreateComplaintDto {
  asunto: string;
  dirigido_a: ComplaintTarget;
  residente_objetivo_id?: number;
  residencia_id?: number;
  cuerpo_mensaje: string;
  es_anonima?: boolean;
  es_anonimo?: boolean;
  categoria: ComplaintCategory;
  prioridad: ComplaintPriority;
  fecha_queja?: Date | string;
}

export interface UpdateComplaintDto {
  estado?: ComplaintStatus;
  respuesta?: string;
  categoria?: ComplaintCategory;
  prioridad?: ComplaintPriority;
}