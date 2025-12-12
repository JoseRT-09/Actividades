const User = require('./User');
const Report = require('./Report');
const ReportComment = require('./ReportComment');
const Residence = require('./Residence');

// Asociaciones para Report
Report.belongsTo(User, {
  foreignKey: 'reportado_por_id',
  as: 'reportadoPor'
});

Report.belongsTo(User, {
  foreignKey: 'asignado_a',
  as: 'asignadoA'
});

Report.belongsTo(Residence, {
  foreignKey: 'residencia_id',
  as: 'residencia'
});

Report.hasMany(ReportComment, {
  foreignKey: 'report_id',
  as: 'comments'
});

// Asociaciones para ReportComment
ReportComment.belongsTo(Report, {
  foreignKey: 'report_id',
  as: 'report'
});

ReportComment.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'usuario'
});

// Asociaciones para User
User.hasMany(Report, {
  foreignKey: 'reportado_por_id',
  as: 'reportesCreados'
});

User.hasMany(Report, {
  foreignKey: 'asignado_a',
  as: 'reportesAsignados'
});

User.hasMany(ReportComment, {
  foreignKey: 'user_id',
  as: 'comments'
});

// Asociaciones para Residence
Residence.hasMany(Report, {
  foreignKey: 'residencia_id',
  as: 'reports'
});

module.exports = {
  User,
  Report,
  ReportComment,
  Residence
};
