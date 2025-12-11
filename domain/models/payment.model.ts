import { User } from './user.model';
import { ServiceCost } from './service-cost.model';

export enum PaymentMethod {
  EFECTIVO = 'Efectivo',
  TRANSFERENCIA = 'Transferencia',
  TARJETA = 'Tarjeta',
  CHEQUE = 'Cheque'
}

export enum PaymentStatus {
  COMPLETADO = 'Completado',
  PENDIENTE = 'Pendiente',
  RECHAZADO = 'Rechazado'
}

export interface Payment {
  id: number;
  usuario_id: number;
  costo_servicio_id: number;
  monto_pagado: number;
  monto: number; 
  fecha_pago: Date | string;
  metodo_pago: PaymentMethod;
  estado: PaymentStatus;
  referencia?: string;
  comprobante_url?: string;
  notas?: string;
  created_at?: Date | string;
  updated_at?: Date | string;
  
  // Relaciones
  usuario?: User;
  residente?: User;
  costoServicio?: ServiceCost;
  servicioCosto?: ServiceCost;
}

export interface CreatePaymentDto {
  usuario_id: number;
  costo_servicio_id: number;
  monto_pagado: number;
  metodo_pago: PaymentMethod;
  fecha_pago?: Date | string;
  estado: PaymentStatus;
  referencia?: string;
  comprobante_url?: string;
  notas?: string;
}

export interface UpdatePaymentDto {
  usuario_id?: number;
  costo_servicio_id?: number;
  monto_pagado?: number;
  metodo_pago?: PaymentMethod;
  fecha_pago?: Date | string;
  estado?: PaymentStatus;
  referencia?: string;
  comprobante_url?: string;
  notas?: string;
}