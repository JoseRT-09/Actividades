const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReassignmentHistory = sequelize.define('ReassignmentHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  residencia_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'residences',
      key: 'id'
    }
  },
  residente_anterior_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  residente_nuevo_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  tipo_cambio: {
    type: DataTypes.ENUM('Asignacion', 'Cambio', 'Liberacion', 'Venta', 'Renta', 'Cambio Responsable', 'Herencia')
  },
  motivo: {
    type: DataTypes.TEXT
  },
  fecha_cambio: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  autorizado_por: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'reassignment_history',
  timestamps: false
});

module.exports = ReassignmentHistory;