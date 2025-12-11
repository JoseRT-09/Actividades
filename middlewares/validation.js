// Backend/src/middlewares/validation.js (CORREGIDO)
const { body, validationResult } = require('express-validator');

// Middleware para validar errores
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validaciones para usuarios
exports.validateUserRegistration = [
  body('nombre').trim().notEmpty().withMessage('El nombre es requerido'),
  body('apellido').trim().notEmpty().withMessage('El apellido es requerido'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('rol').optional().isIn(['Residente', 'Administrador', 'SuperAdmin']).withMessage('Rol inválido')
];

exports.validateUserLogin = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('La contraseña es requerida')
];

// Validaciones para residencias
exports.validateResidence = [
  body('numero_unidad').trim().notEmpty().withMessage('El número de unidad es requerido'),
  body('area_m2').optional().isFloat({ min: 0 }).withMessage('El área debe ser un número positivo')
];

// Validaciones para costos de servicio
exports.validateServiceCost = [
  body('nombre_servicio').trim().notEmpty().withMessage('El nombre del servicio es requerido'),
  body('monto').isFloat({ min: 0 }).withMessage('El monto debe ser un número positivo'),
  body('fecha_inicio').isISO8601().withMessage('Fecha de inicio inválida'),
  body('fecha_vencimiento').isISO8601().withMessage('Fecha de vencimiento inválida')
];

// Validaciones para pagos
exports.validatePayment = [
  body('residente_id').isInt().withMessage('ID de residente inválido'),
  body('servicio_costo_id').isInt().withMessage('ID de costo de servicio inválido'),
  body('monto_pagado').isFloat({ min: 0 }).withMessage('El monto pagado debe ser un número positivo'),
  body('metodo_pago').isIn(['Efectivo', 'Transferencia', 'Tarjeta', 'Cheque']).withMessage('Método de pago inválido')
];

// Validaciones para reportes
exports.validateReport = [
  body('tipo').isIn(['Mantenimiento', 'Limpieza', 'Seguridad', 'Instalaciones', 'Otro']).withMessage('Tipo de reporte inválido'),
  body('titulo').trim().notEmpty().withMessage('El título es requerido'),
  body('descripcion').trim().notEmpty().withMessage('La descripción es requerida'),
  body('prioridad').optional().isIn(['Baja', 'Media', 'Alta', 'Crítica']).withMessage('Prioridad inválida')
];

// Validaciones para quejas (Alineado con Complaint.js)
exports.validateComplaint = [
  body('asunto').trim().notEmpty().withMessage('El asunto es requerido'),
  body('descripcion').trim().notEmpty().withMessage('La descripción es requerida')
];

// Validaciones para actividades (Alineado con Activity.js)
exports.validateActivity = [
  body('titulo').trim().notEmpty().withMessage('El nombre de la actividad es requerido'),
  body('tipo').isIn(['Reunión', 'Evento', 'Mantenimiento', 'Asamblea', 'Celebración', 'Otro']).withMessage('Tipo de actividad inválido'),
  body('fecha_inicio').isISO8601().withMessage('Fecha y hora de inicio inválida'),
  body('fecha_fin').optional().isISO8601().withMessage('Fecha y hora de fin inválida'),
  body('max_participantes').optional().isInt({ min: 0 }).withMessage('El cupo máximo debe ser un número entero positivo')
];

// Validaciones para amenidades (Alineado con Amenity.js)
exports.validateAmenity = [
  body('nombre').trim().notEmpty().withMessage('El nombre de la amenidad es requerido'),
  body('capacidad_maxima').optional().isInt({ min: 1 }).withMessage('La capacidad debe ser un número entero positivo')
];

// Validaciones para reservas
exports.validateReservation = [
  body('amenidad_id').isInt().withMessage('ID de amenidad inválido'),
  body('fecha_reserva').isISO8601().withMessage('Fecha de reserva inválida'),
  body('hora_inicio').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Hora de inicio inválida'),
  body('hora_fin').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Hora de fin inválida')
];