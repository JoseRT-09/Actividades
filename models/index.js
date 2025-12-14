const sequelize = require('../config/database');

// ===== IMPORTAR TODOS LOS MODELOS =====
const User = require('./User');
const Residence = require('./Residence');
const ReassignmentHistory = require('./ReassignmentHistory');
const Activity = require('./Activity');
const Amenity = require('./Amenity');
const AmenityReservation = require('./AmenityReservation');
const Report = require('./Report');
const ReportComment = require('./ReportComment');
const Complaint = require('./Complaint');
const ComplaintComment = require('./ComplaintComment');
const Payment = require('./Payment');
const ServiceCost = require('./ServiceCost');

// Verificar que todos los modelos se cargaron correctamente
if (!User) {
  throw new Error('Error: User no se cargó correctamente');
}
if (!Activity) {
  throw new Error('Error: Activity no se cargó correctamente');
}
if (!Amenity) {
  throw new Error('Error: Amenity no se cargó correctamente');
}
if (!AmenityReservation) {
  throw new Error('Error: AmenityReservation no se cargó correctamente');
}
if (!Report) {
  throw new Error('Error: Report no se cargó correctamente');
}
if (!ReportComment) {
  throw new Error('Error: ReportComment no se cargó correctamente');
}
if (!Complaint) {
  throw new Error('Error: Complaint no se cargó correctamente');
}
if (!ComplaintComment) {
  throw new Error('Error: ComplaintComment no se cargó correctamente');
}

// Verificar que los modelos tienen los métodos necesarios de Sequelize
if (typeof Activity.hasMany !== 'function') {
  console.error('ERROR: Activity no es un modelo Sequelize válido');
  console.error('Tipo de Activity:', typeof Activity);
  console.error('Activity:', Activity);
  console.error('Propiedades de Activity:', Object.keys(Activity));
  throw new Error('Activity no tiene el método hasMany. Verifica que sequelize.define() funcione correctamente.');
}
if (typeof Amenity.hasMany !== 'function') {
  console.error('ERROR: Amenity no es un modelo Sequelize válido');
  console.error('Tipo de Amenity:', typeof Amenity);
  console.error('Amenity:', Amenity);
  console.error('Propiedades de Amenity:', Object.keys(Amenity));
  throw new Error('Amenity no tiene el método hasMany. Verifica que sequelize.define() funcione correctamente.');
}
if (typeof User.hasMany !== 'function') {
  throw new Error('User no es un modelo Sequelize válido');
}

// ===== DEFINIR ASOCIACIONES =====

// ===== RELACIONES DE RESIDENCE =====
// Residence - Dueño
Residence.belongsTo(User, {
  foreignKey: 'dueno_id',
  as: 'dueno'
});
User.hasMany(Residence, {
  foreignKey: 'dueno_id',
  as: 'residenciasComodueno'
});

// Residence - Residente Actual
Residence.belongsTo(User, {
  foreignKey: 'residente_actual_id',
  as: 'residenteActual'
});
User.hasMany(Residence, {
  foreignKey: 'residente_actual_id',
  as: 'residenciasComoResidente'
});

// Residence - Administrador
Residence.belongsTo(User, {
  foreignKey: 'administrador_id',
  as: 'administrador'
});
User.hasMany(Residence, {
  foreignKey: 'administrador_id',
  as: 'residenciasComoAdministrador'
});

// ===== RELACIONES DE REASSIGNMENT HISTORY =====
ReassignmentHistory.belongsTo(Residence, {
  foreignKey: 'residencia_id',
  as: 'residencia'
});
Residence.hasMany(ReassignmentHistory, {
  foreignKey: 'residencia_id',
  as: 'historialReasignaciones'
});

ReassignmentHistory.belongsTo(User, {
  foreignKey: 'residente_anterior_id',
  as: 'residenteAnterior'
});
ReassignmentHistory.belongsTo(User, {
  foreignKey: 'residente_nuevo_id',
  as: 'residenteNuevo'
});
ReassignmentHistory.belongsTo(User, {
  foreignKey: 'autorizado_por',
  as: 'autorizadoPor'
});

// ===== RELACIONES DE ACTIVITY =====
User.hasMany(Activity, {
  foreignKey: 'organizador_id',
  as: 'actividadesOrganizadas'
});
Activity.belongsTo(User, {
  foreignKey: 'organizador_id',
  as: 'organizador'
});

// ===== RELACIONES DE AMENITY =====
Amenity.hasMany(AmenityReservation, {
  foreignKey: 'amenidad_id',
  as: 'reservas'
});
AmenityReservation.belongsTo(Amenity, {
  foreignKey: 'amenidad_id',
  as: 'amenidad'
});

User.hasMany(AmenityReservation, {
  foreignKey: 'residente_id',
  as: 'reservasAmenidades'
});
AmenityReservation.belongsTo(User, {
  foreignKey: 'residente_id',
  as: 'residente'
});

// ===== RELACIONES DE REPORT =====
User.hasMany(Report, {
  foreignKey: 'reportado_por_id',
  as: 'reportesCreados'
});
Report.belongsTo(User, {
  foreignKey: 'reportado_por_id',
  as: 'reportadoPor'
});

User.hasMany(Report, {
  foreignKey: 'asignado_a',
  as: 'reportesAsignados'
});
Report.belongsTo(User, {
  foreignKey: 'asignado_a',
  as: 'asignadoA'
});

Residence.hasMany(Report, {
  foreignKey: 'residencia_id',
  as: 'reportes'
});
Report.belongsTo(Residence, {
  foreignKey: 'residencia_id',
  as: 'residencia'
});

// ===== RELACIONES DE REPORT COMMENT =====
Report.hasMany(ReportComment, {
  foreignKey: 'report_id',
  as: 'comments'
});
ReportComment.belongsTo(Report, {
  foreignKey: 'report_id',
  as: 'report'
});

User.hasMany(ReportComment, {
  foreignKey: 'user_id',
  as: 'reportComments'
});
ReportComment.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'usuario'
});

// ===== RELACIONES DE COMPLAINT =====
User.hasMany(Complaint, {
  foreignKey: 'usuario_id',
  as: 'quejas'
});
Complaint.belongsTo(User, {
  foreignKey: 'usuario_id',
  as: 'usuario'
});

Residence.hasMany(Complaint, {
  foreignKey: 'residencia_id',
  as: 'quejas'
});
Complaint.belongsTo(Residence, {
  foreignKey: 'residencia_id',
  as: 'residencia'
});

// ===== RELACIONES DE COMPLAINT COMMENT =====
Complaint.hasMany(ComplaintComment, {
  foreignKey: 'complaint_id',
  as: 'comments'
});
ComplaintComment.belongsTo(Complaint, {
  foreignKey: 'complaint_id',
  as: 'complaint'
});

User.hasMany(ComplaintComment, {
  foreignKey: 'user_id',
  as: 'complaintComments'
});
ComplaintComment.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'usuario'
});

// ===== RELACIONES DE PAYMENT =====
User.hasMany(Payment, {
  foreignKey: 'residente_id',
  as: 'pagos'
});
Payment.belongsTo(User, {
  foreignKey: 'residente_id',
  as: 'residente'
});

ServiceCost.hasMany(Payment, {
  foreignKey: 'servicio_costo_id',
  as: 'pagos'
});
Payment.belongsTo(ServiceCost, {
  foreignKey: 'servicio_costo_id',
  as: 'servicioCosto'
});

// ===== RELACIONES DE SERVICE COST =====
Residence.hasMany(ServiceCost, {
  foreignKey: 'residencia_id',
  as: 'costos'
});
ServiceCost.belongsTo(Residence, {
  foreignKey: 'residencia_id',
  as: 'residencia'
});

// Exportar modelos
module.exports = {
  sequelize,
  User,
  Residence,
  ReassignmentHistory,
  Activity,
  Amenity,
  AmenityReservation,
  Report,
  ReportComment,
  Complaint,
  ComplaintComment,
  Payment,
  ServiceCost
};
