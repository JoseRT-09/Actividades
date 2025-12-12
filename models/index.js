'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    try {
      const model = require(path.join(__dirname, file));
      if (typeof model === 'function') {
        const initializedModel = model(sequelize, Sequelize.DataTypes);
        db[initializedModel.name] = initializedModel;
      } else {
        // Para modelos que ya están inicializados con sequelize.define
        db[model.name] = model;
      }
    } catch (error) {
      console.error(`Error loading model from file ${file}:`, error);
    }
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Definir asociaciones manualmente
if (db.Report && db.User && db.ReportComment && db.Residence) {
  // Asociaciones para Report
  db.Report.belongsTo(db.User, { foreignKey: 'reportado_por_id', as: 'reportadoPor' });
  db.Report.belongsTo(db.User, { foreignKey: 'asignado_a', as: 'asignadoA' });
  db.Report.belongsTo(db.Residence, { foreignKey: 'residencia_id', as: 'residencia' });
  db.Report.hasMany(db.ReportComment, { foreignKey: 'report_id', as: 'comments' });

  // Asociaciones para ReportComment
  db.ReportComment.belongsTo(db.Report, { foreignKey: 'report_id', as: 'report' });
  db.ReportComment.belongsTo(db.User, { foreignKey: 'user_id', as: 'usuario' });

  // Asociaciones para User
  db.User.hasMany(db.Report, { foreignKey: 'reportado_por_id', as: 'reportesCreados' });
  db.User.hasMany(db.Report, { foreignKey: 'asignado_a', as: 'reportesAsignados' });
  db.User.hasMany(db.ReportComment, { foreignKey: 'user_id', as: 'comments' });

  // Asociaciones para Residence
  db.Residence.hasMany(db.Report, { foreignKey: 'residencia_id', as: 'reports' });
}

// Asociaciones para Complaint
if (db.Complaint && db.User && db.ComplaintComment && db.Residence) {
  // Asociaciones para Complaint
  db.Complaint.belongsTo(db.User, { foreignKey: 'usuario_id', as: 'usuario' });
  db.Complaint.belongsTo(db.Residence, { foreignKey: 'residencia_id', as: 'residencia' });
  db.Complaint.hasMany(db.ComplaintComment, { foreignKey: 'complaint_id', as: 'comments' });

  // Asociaciones para ComplaintComment
  db.ComplaintComment.belongsTo(db.Complaint, { foreignKey: 'complaint_id', as: 'complaint' });
  db.ComplaintComment.belongsTo(db.User, { foreignKey: 'user_id', as: 'usuario' });

  // Asociaciones para User (quejas)
  db.User.hasMany(db.Complaint, { foreignKey: 'usuario_id', as: 'quejasCreadas' });
  db.User.hasMany(db.ComplaintComment, { foreignKey: 'user_id', as: 'complaintComments' });

  // Asociaciones para Residence (quejas)
  db.Residence.hasMany(db.Complaint, { foreignKey: 'residencia_id', as: 'complaints' });
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
