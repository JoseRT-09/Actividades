import { Residence } from './residence.model';

export enum ServiceCostPeriod {
  MENSUAL = 'Mensual',
  TRIMESTRAL = 'Trimestral',
  ANUAL = 'Anual'
}

export enum ServiceCostStatus {
  PENDIENTE = 'Pendiente',
  PAGADO = 'Pagado',
  VENCIDO = 'Vencido'
}

export interface ServiceCost {
  id: number;
  nombre_servicio: string;
  concepto: string;
  descripcion?: string;
  notas?: string;
  monto: number;
  periodo: ServiceCostPeriod;
  residencia_id?: number;
  fecha_inicio: Date | string;
  fecha_vencimiento: Date | string;
  estado: ServiceCostStatus;
  created_at?: Date;

  // Relaciones
  Residence?: Residence;
  residencia?: Residence;
}

export interface CreateServiceCostDto {
  nombre_servicio: string;
  descripcion?: string;
  monto: number;
  periodo: ServiceCostPeriod;
  residencia_id?: number;
  fecha_inicio: Date | string;
  fecha_vencimiento: Date | string;
}

export interface UpdateServiceCostDto {
  nombre_servicio?: string;
  descripcion?: string;
  monto?: number;
  periodo?: ServiceCostPeriod;
  fecha_vencimiento?: Date | string;
  estado?: ServiceCostStatus;
}