// Enums
export enum ActivityType {
  REUNION = 'ReuniÃ³n',
  EVENTO = 'Evento',
  MANTENIMIENTO = 'Mantenimiento',
  ASAMBLEA = 'Asamblea',
  CELEBRACION = 'CelebraciÃ³n',
  OTRO = 'Otro'
}

export enum ActivityStatus {
  PROGRAMADA = 'Programada',
  EN_CURSO = 'En Curso',
  COMPLETADA = 'Completada',
  CANCELADA = 'Cancelada'
}
export interface Activity {
  id: number;
  titulo: string;
  descripcion: string;
  tipo: ActivityType;
  fecha_inicio: Date | string;
  fecha_fin?: Date | string | null;
  ubicacion: string;
  organizador_id: number;
  organizador?: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
  };
  max_participantes?: number;
  inscritos_count?: number;
  estado: ActivityStatus;
  notas?: string;
  created_at: Date | string;
  updated_at: Date | string;
}
export interface CreateActivityDto {
  titulo: string;
  descripcion: string;
  tipo: ActivityType;
  fecha_inicio: Date | string;
  fecha_fin?: Date | string;
  ubicacion: string;
  organizador_id: number;
  max_participantes?: number;
  estado: ActivityStatus;
  notas?: string;
}

export interface UpdateActivityDto {
  titulo?: string;
  descripcion?: string;
  tipo?: ActivityType;
  fecha_inicio?: Date | string;
  fecha_fin?: Date | string;
  ubicacion?: string;
  organizador_id?: number;
  max_participantes?: number;
  estado?: ActivityStatus;
  notas?: string;
}