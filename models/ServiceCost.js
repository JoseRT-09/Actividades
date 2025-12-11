// Backend/src/models/ServiceCost.js (CORREGIDO)
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ServiceCost = sequelize.define('ServiceCost', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre_servicio: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT
  },
  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  periodo: {
    type: DataTypes.ENUM('Mensual', 'Trimestral', 'Anual'),
    defaultValue: 'Mensual'
  },
  residencia_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'residences',
      key: 'id'
    }
  },
  fecha_inicio: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  fecha_vencimiento: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('Pendiente', 'Pagado', 'Vencido'),
    defaultValue: 'Pendiente'
  }
}, {
  tableName: 'service_costs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = ServiceCost;