import { Residence } from './residence.model';
import { User } from './user.model';

export enum ReportType {
  MANTENIMIENTO = 'Mantenimiento', // ✅ CORRECCIÓN: Nombres de reporte del backend
  LIMPIEZA = 'Limpieza',
  SEGURIDAD = 'Seguridad',
  INSTALACIONES = 'Instalaciones',
  OTRO = 'Otro'
}

export enum ReportPriority {
  BAJA = 'Baja',
  MEDIA = 'Media',
  ALTA = 'Alta',
  CRITICA = 'Crítica'
}

export type ReportStatus = 'Abierto' | 'En Progreso' | 'Resuelto' | 'Cerrado';

export interface Report {
  id: number;
  tipo: ReportType;
  residencia_id?: number;
  reportado_por_id?: number;  // ✅ CORRECCIÓN: Usar snake_case ID (el backend lo devuelve)
  titulo: string;
  descripcion: string;
  prioridad: ReportPriority;
  estado: ReportStatus;
  asignado_a?: number;
  fecha_resolucion?: Date | string;
  created_at?: Date | string;
  updated_at?: Date | string;
  
  // Relaciones (pueden venir del backend con includes)
  Residence?: Residence;
  residencia?: Residence;  // Alias
  reportadoPor?: User; // ✅ Campo correcto (soluciona el error de casing)
  asignadoA?: User;
}

export interface CreateReportDto {
  tipo: ReportType;
  residencia_id?: number;
  titulo: string;
  descripcion: string;
  prioridad?: ReportPriority;
}

export interface UpdateReportDto {
  titulo?: string;
  descripcion?: string;
  prioridad?: ReportPriority;
  estado?: string | ReportStatus;
  asignado_a?: number;
}

export interface ReportStatistics {
  total: number;
  byStatus: {
    abierto: number;
    enProgreso: number;
    resuelto: number;
    cerrado: number;
  };
  byPriority: {
    critica: number;
    alta: number;
  };
  byType: Array<{
    tipo: string;
    count: number;
  }>;
}