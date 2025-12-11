export enum UserRole {
  RESIDENTE = 'Residente',
  ADMINISTRADOR = 'Administrador',
  SUPER_ADMIN = 'SuperAdmin'
}

export enum UserStatus {
  ACTIVO = 'Activo',
  INACTIVO = 'Inactivo'
}

export interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  rol: UserRole;
  estado: UserStatus;
  fecha_registro?: Date;
  updated_at?: Date;
}

export interface CreateUserDto {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono?: string;
  rol?: UserRole;
}

export interface UpdateUserDto {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  rol?: UserRole;
  estado?: UserStatus;
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono?: string;
  rol?: UserRole;
}