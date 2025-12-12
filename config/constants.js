module.exports = {
  ROLES: {
    RESIDENTE: 'Residente',
    ADMINISTRADOR: 'Administrador',
    SUPER_ADMIN: 'SuperAdmin'
  },
  ESTADOS_USUARIO: {
    ACTIVO: 'Activo',
    INACTIVO: 'Inactivo'
  },
  ESTADOS_RESIDENCIA: {
    OCUPADA: 'Ocupada',
    DISPONIBLE: 'Disponible',
    MANTENIMIENTO: 'Mantenimiento'
  },
  
  // ===== COMPLAINTS (QUEJAS) =====
  CATEGORIAS_QUEJA: {
    RUIDO: 'Ruido',
    CONVIVENCIA: 'Convivencia',
    MASCOTAS: 'Mascotas',
    ESTACIONAMIENTO: 'Estacionamiento',
    AREAS_COMUNES: 'Áreas Comunes',
    LIMPIEZA: 'Limpieza',
    SEGURIDAD: 'Seguridad',
    MANTENIMIENTO: 'Mantenimiento',
    ADMINISTRACION: 'Administración',
    OTRO: 'Otro'
  },
  ESTADOS_QUEJA: {
    NUEVA: 'Nueva',
    EN_REVISION: 'En Revisión',
    EN_PROCESO: 'En Proceso',
    RESUELTA: 'Resuelta',
    RECHAZADA: 'Rechazada'
  },
  PRIORIDADES_QUEJA: {
    BAJA: 'Baja',
    MEDIA: 'Media',
    ALTA: 'Alta',
    URGENTE: 'Urgente'
  },
  
  // ===== REPORTS (REPORTES) =====
  TIPOS_REPORTE: {
    MANTENIMIENTO: 'Mantenimiento',
    LIMPIEZA: 'Limpieza',
    SEGURIDAD: 'Seguridad',
    INSTALACIONES: 'Instalaciones',
    OTRO: 'Otro'
  },
  ESTADOS_REPORTE: {
    ABIERTO: 'Abierto',
    EN_PROGRESO: 'En Progreso',
    RESUELTO: 'Resuelto'
  },
  PRIORIDADES_REPORTE: {
    BAJA: 'Baja',
    MEDIA: 'Media',
    ALTA: 'Alta',
    CRITICA: 'Crítica'
  },
  
  // ===== PAYMENTS (PAGOS) =====
  ESTADOS_PAGO: {
    COMPLETADO: 'Completado',
    PENDIENTE: 'Pendiente',
    RECHAZADO: 'Rechazado'
  },
  METODOS_PAGO: {
    EFECTIVO: 'Efectivo',
    TARJETA: 'Tarjeta',
    TRANSFERENCIA: 'Transferencia',
    CHEQUE: 'Cheque'
  },
  
  // ===== SERVICE COSTS =====
  ESTADOS_COSTO: {
    PENDIENTE: 'Pendiente',
    PAGADO: 'Pagado',
    VENCIDO: 'Vencido'
  },
  
  // ===== ACTIVITIES =====
  ESTADOS_ACTIVIDAD: {
    PROGRAMADA: 'Programada',
    EN_CURSO: 'En Curso',
    COMPLETADA: 'Completada',
    CANCELADA: 'Cancelada'
  },
  
  // ===== AMENITIES =====
  TIPOS_AMENIDAD: {
    SALON_EVENTOS: 'Salón de Eventos',
    GIMNASIO: 'Gimnasio',
    PISCINA: 'Piscina',
    CANCHA_DEPORTIVA: 'Cancha Deportiva',
    AREA_BBQ: 'Área BBQ',
    SALON_JUEGOS: 'Salón de Juegos',
    AREA_INFANTIL: 'Área Infantil',
    OTRO: 'Otro'
  },
  ESTADOS_AMENIDAD: {
    DISPONIBLE: 'Disponible',
    OCUPADA: 'Ocupada',
    MANTENIMIENTO: 'Mantenimiento',
    FUERA_SERVICIO: 'Fuera de Servicio'
  }
};