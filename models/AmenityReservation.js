// Backend/src/models/AmenityReservation.js (CORREGIDO)
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AmenityReservation = sequelize.define('AmenityReservation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  amenidad_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'amenities',
      key: 'id'
    }
  },
  residente_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  fecha_reserva: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  hora_inicio: {
    type: DataTypes.TIME,
    allowNull: false
  },
  hora_fin: {
    type: DataTypes.TIME,
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('Pendiente', 'Confirmada', 'Cancelada', 'Completada'),
    defaultValue: 'Pendiente'
  },
  motivo: {
    type: DataTypes.TEXT
  },
  num_personas: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null
  }
}, {
  tableName: 'amenity_reservations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = AmenityReservation;